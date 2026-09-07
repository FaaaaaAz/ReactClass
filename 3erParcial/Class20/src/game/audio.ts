import type { SoundEvent } from './engine'

const tones: Record<SoundEvent, [number, number, number, OscillatorType]> = {
  shot: [430, 150, 0.075, 'triangle'],
  hit: [190, 45, 0.13, 'sawtooth'],
  damage: [130, 35, 0.25, 'square'],
  wave: [390, 780, 0.3, 'sine'],
  victory: [520, 1040, 0.5, 'sine'],
  gameover: [240, 55, 0.55, 'triangle'],
}

export class GameAudio {
  private context: AudioContext | null = null
  enabled = false

  activate(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) { this.suspend(); return }
    try {
      this.context ??= new AudioContext()
      void this.context.resume().catch(() => {})
    } catch { this.enabled = false }
  }

  suspend() {
    if (this.context?.state === 'running') void this.context.suspend().catch(() => {})
  }

  play(event: SoundEvent) {
    if (!this.enabled || this.context?.state !== 'running') return
    const [start, end, duration, type] = tones[event]
    const now = this.context.currentTime
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(start, now)
    oscillator.frequency.exponentialRampToValueAtTime(end, now + duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(event === 'shot' ? 0.025 : 0.045, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    oscillator.connect(gain).connect(this.context.destination)
    oscillator.start(now)
    oscillator.stop(now + duration)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
  }

  dispose() {
    if (this.context) void this.context.close().catch(() => {})
    this.context = null
  }
}
