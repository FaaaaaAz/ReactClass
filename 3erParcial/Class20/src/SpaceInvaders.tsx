import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import naveImg from './assets/nave.png'
import alienImg from './assets/alien.png'
import piedraImg from './assets/piedra.png'
import Reloj from './Reloj'
import { GameEngine, TOTAL_WAVES, WAVE_NAMES, WORLD_HEIGHT } from './game/engine'
import type { Input } from './game/engine'
import { GameAudio } from './game/audio'
import { renderGame } from './game/renderer'
import type { Sprites } from './game/renderer'

type IconName = 'arrow' | 'pause' | 'play' | 'sound' | 'muted' | 'shield' | 'target' | 'trophy' | 'restart' | 'home' | 'left' | 'right'
function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    arrow: 'M4 12h15m-6-6 6 6-6 6', left: 'm14 5-7 7 7 7', right: 'm10 5 7 7-7 7',
    pause: 'M8 5v14M16 5v14', play: 'm8 4 12 8-12 8Z',
    sound: 'M11 4 6 8H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
    muted: 'M11 4 6 8H3v8h3l5 4ZM16 9l6 6m0-6-6 6',
    shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6',
    target: 'M12 2v4m0 12v4M2 12h4m12 0h4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
    trophy: 'M8 3h8v8a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 3v6m-4 0h8',
    restart: 'M4 10a8 8 0 1 1 1 8M4 4v6h6', home: 'm3 11 9-8 9 8M5 10v11h14V10m-10 11v-7h6v7',
  }
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

function readSaved(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* La partida funciona también sin almacenamiento. */ }
}
const formatScore = (value: number) => value.toLocaleString('es-BO', { minimumIntegerDigits: 6, useGrouping: false })
const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'])

function Controls({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'controls controls-compact' : 'controls'} id={compact ? undefined : 'game-controls'}>
    <div className="control-item"><span className="key-group"><kbd>←</kbd><kbd>→</kbd><span className="key-alternative">/ A D</span></span><span>Mover nave</span></div>
    <div className="control-item"><kbd className="space-key">ESPACIO</kbd><span>Mantén para disparar</span></div>
    <div className="control-item"><span className="key-group"><kbd>ESC</kbd><span className="key-alternative">/ P</span></span><span>Pausar misión</span></div>
  </div>
}

export default function SpaceInvaders() {
  const [engine] = useState(() => new GameEngine())
  const [audio] = useState(() => new GameAudio())
  const [snapshot, setSnapshot] = useState(() => engine.snapshot())
  const [best, setBest] = useState(() => {
    const value = Number(readSaved('space-invaders-best'))
    return Number.isSafeInteger(value) && value > 0 ? value : 0
  })
  const bestRef = useRef(best)
  const [previousBest, setPreviousBest] = useState(best)
  const [sound, setSound] = useState(() => readSaved('space-invaders-sound') === 'true')
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const spritesRef = useRef<Sprites | null>(null)
  const keys = useRef(new Set<string>())
  const pointers = useRef(new Map<number, keyof Input>())
  const phase = snapshot.phase
  const isModal = phase === 'paused' || phase === 'gameover' || phase === 'victory'
  const inMission = phase !== 'menu'

  const sync = useCallback(() => {
    setSnapshot(engine.snapshot())
    if (engine.score > bestRef.current) {
      bestRef.current = engine.score
      setBest(engine.score)
      save('space-invaders-best', String(engine.score))
    }
  }, [engine])
  const clearInput = useCallback(() => { keys.current.clear(); pointers.current.clear() }, [])
  const start = useCallback(() => {
    if (!ready) return
    clearInput()
    setPreviousBest(bestRef.current)
    engine.start()
    audio.activate(sound)
    sync()
    canvasRef.current?.focus({ preventScroll: true })
  }, [audio, clearInput, engine, ready, sound, sync])
  const pause = useCallback(() => {
    engine.pause()
    clearInput()
    audio.suspend()
    sync()
  }, [audio, clearInput, engine, sync])
  const resume = useCallback(() => {
    clearInput()
    engine.resume()
    audio.activate(sound)
    sync()
    canvasRef.current?.focus({ preventScroll: true })
  }, [audio, clearInput, engine, sound, sync])
  const goHome = () => { clearInput(); engine.menu(); audio.suspend(); sync() }
  const toggleSound = useCallback(() => {
    const enabled = !sound
    setSound(enabled)
    save('space-invaders-sound', String(enabled))
    audio.activate(enabled)
    if (enabled) audio.play('wave')
  }, [audio, sound])

  useEffect(() => {
    let cancelled = false
    const load = async (src: string) => {
      const image = new Image()
      image.src = src
      await image.decode()
      return image
    }
    void Promise.all([load(naveImg), load(alienImg), load(piedraImg)]).then(([player, alien, stone]) => {
      if (!cancelled) { spritesRef.current = { player, alien, stone }; setReady(true) }
    }).catch(() => { if (!cancelled) setLoadError(true) })
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const changed = () => setReducedMotion(media.matches)
    media.addEventListener('change', changed)
    return () => { cancelled = true; media.removeEventListener('change', changed); audio.dispose() }
  }, [audio])

  useEffect(() => {
    const canvas = canvasRef.current
    const surface = surfaceRef.current
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !surface || !ctx) return
    const resize = () => {
      const { width, height } = surface.getBoundingClientRect()
      if (!width || !height) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      engine.resize(WORLD_HEIGHT * width / height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    resize()
    let frame = 0
    let previousTime = 0
    let lastSync = 0
    const tick = (now: number) => {
      const delta = previousTime ? (now - previousTime) / 1000 : 0
      previousTime = now
      const currentPhase = engine.phase
      const touch = [...pointers.current.values()]
      engine.update(delta, {
        left: keys.current.has('ArrowLeft') || keys.current.has('KeyA') || touch.includes('left'),
        right: keys.current.has('ArrowRight') || keys.current.has('KeyD') || touch.includes('right'),
        fire: keys.current.has('Space') || touch.includes('fire'),
      })
      for (const event of engine.drainEvents()) audio.play(event)
      if (spritesRef.current && engine.phase !== 'menu') renderGame(ctx, engine, spritesRef.current, reducedMotion)
      if (now - lastSync >= 80 || engine.phase !== currentPhase) { sync(); lastSync = now }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [audio, engine, reducedMotion, sync])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const targetIsButton = event.target instanceof HTMLElement && !!event.target.closest('button')
      if (gameKeys.has(event.code) && ['playing', 'countdown', 'wave'].includes(engine.phase)) {
        if (event.code === 'Space' && targetIsButton) return
        event.preventDefault()
        keys.current.add(event.code)
      }
      if (event.repeat) return
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault()
        if (engine.phase === 'paused') resume()
        else if (['playing', 'countdown', 'wave'].includes(engine.phase)) pause()
      }
      if (event.code === 'Enter' && engine.phase === 'menu' && !targetIsButton) { event.preventDefault(); start() }
      if (event.code === 'KeyM' && engine.phase !== 'paused') toggleSound()
    }
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code) }
    const blur = () => { clearInput(); if (['playing', 'countdown', 'wave'].includes(engine.phase)) pause() }
    const hidden = () => { if (document.hidden) blur() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [clearInput, engine, pause, resume, start, toggleSound])

  useEffect(() => {
    if (isModal) dialogRef.current?.querySelector('button')?.focus({ preventScroll: true })
    else if (phase === 'menu' && ready) startRef.current?.focus({ preventScroll: true })
    else if (phase === 'countdown' || phase === 'playing') canvasRef.current?.focus({ preventScroll: true })
  }, [isModal, phase, ready])

  function hold(event: ReactPointerEvent<HTMLButtonElement>, control: keyof Input) {
    event.preventDefault()
    if (engine.phase !== 'playing') return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, control)
  }
  function release(event: ReactPointerEvent<HTMLButtonElement>) { pointers.current.delete(event.pointerId) }

  return <div className={`game-app ${inMission ? 'in-mission' : 'at-home'} ${phase === 'paused' ? 'is-paused' : ''}`}>
    <header className="app-header" inert={isModal}>
      <div className="brand"><span className="brand-mark"><Icon name="target" /></span><span>ALTIPLANO<span className="brand-sub">ORBITAL DEFENSE</span></span><span className="bolivia-flag" aria-label="Bolivia" role="img" /></div>
      <div className="header-actions">
        <div className="record"><Icon name="trophy" /><span>RÉCORD <strong>{formatScore(best)}</strong></span></div>
        <button className="icon-button sound-button" onClick={toggleSound} aria-label={sound ? 'Desactivar sonido' : 'Activar sonido'} aria-pressed={sound} title="Sonido (M)"><Icon name={sound ? 'sound' : 'muted'} /></button>
        <span className="system-status"><i /> SISTEMA EN LÍNEA</span>
      </div>
    </header>
    {phase === 'menu' && <main className="home-screen">
      <section className="hero-section" aria-labelledby="game-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="tiny-cross">+</span> UN CLÁSICO. NUESTRA RESISTENCIA.</div>
          <h1 id="game-title">SPACE<span>INVADERS<span className="title-dot">.</span></span></h1>
          <div className="edition"><span /> EDICIÓN BOLIVIA <span /></div>
          <p className="hero-description">El universo es grande.<br />Las ganas de defender lo nuestro, más.</p>
          <p className="mission-description">Pilota la nave, lanza piedras y frena la invasión.<br className="desktop-break" /> Cinco oleadas separan a Bolivia de la victoria.</p>
          <button ref={startRef} className="primary-button start-button" onClick={start} disabled={!ready}><Icon name="play" /><span>{loadError ? 'No se pudieron cargar los recursos' : ready ? 'Iniciar misión' : 'Preparando la nave…'}</span><Icon name="arrow" /></button>
          {loadError ? <button className="text-button" onClick={() => window.location.reload()}>Reintentar carga</button> : <span className="start-hint">O PRESIONA <kbd>ENTER</kbd><span className="touch-hint"> · CONTROLES TÁCTILES INCLUIDOS</span></span>}
        </div>
        <div className="hero-art" aria-label="Nave con la bandera boliviana lista para enfrentar a los invasores" role="img">
          <div className="orbital-ring ring-one" /><div className="orbital-ring ring-two" /><div className="orbital-ring ring-three" />
          <span className="orbit-coordinate coordinate-top">16°30′ S / 68°09′ O</span>
          <span className="orbit-cross cross-one">+</span><span className="orbit-cross cross-two">+</span>
          <div className="alien-contact"><span className="contact-dot" /> CONTACTO DETECTADO <span>01</span></div>
          <img className="hero-alien alien-one" src={alienImg} alt="" draggable="false" />
          <img className="hero-alien alien-two" src={alienImg} alt="" draggable="false" />
          <img className="hero-stone" src={piedraImg} alt="" draggable="false" />
          <div className="ship-aura" /><img className="hero-ship" src={naveImg} alt="" draggable="false" />
          <div className="ship-caption"><span className="caption-line" /><div><span className="micro-label">TU NAVE / BOL-01</span><strong>Hecha para resistir.</strong></div><span className="bolivia-flag" /></div>
          <span className="orbit-coordinate coordinate-bottom">ÓRBITA TERRESTRE · 382 KM</span>
        </div>
      </section>
      <section className="mission-strip" aria-label="Detalles de la misión">
        <div className="mission-strip-title"><Icon name="shield" /><span>UNA MISIÓN.<br /><strong>TODO UN PAÍS.</strong></span></div>
        <div><strong>05</strong><span>OLEADAS ENEMIGAS</span></div><div><strong>03</strong><span>ESCUDOS DE VIDA</span></div><div><strong>∞</strong><span>PIEDRAS. SIN LÍMITE.</span></div>
        <span className="mission-strip-note">Puntería local.<br />Alcance intergaláctico.</span>
      </section>
      <section className="flight-guide" aria-label="Cómo jugar"><span className="micro-label guide-title">MANUAL DE VUELO <span>01 — 03</span></span><Controls /><p className="touch-guide">En móvil, mantén los botones de dirección y disparo. Esquiva los proyectiles violetas y evita que los aliens crucen tu defensa.</p></section>
    </main>}
    <main className="mission-screen" hidden={!inMission}>
      <section className="hud" aria-label="Estado de la partida" inert={isModal}>
        <div className="hud-score"><span className="micro-label">PUNTAJE</span><strong>{formatScore(snapshot.score)}</strong><span className={`combo-badge ${snapshot.combo > 1 ? 'combo-active' : ''}`}>×{snapshot.combo}</span></div>
        <div className="hud-wave"><span className="micro-label">OLEADA {String(snapshot.wave).padStart(2, '0')} / 05</span><strong>{WAVE_NAMES[snapshot.wave - 1]}</strong><div className="wave-segments">{Array.from({ length: TOTAL_WAVES }, (_, i) => <span className={i < snapshot.wave ? 'filled' : ''} key={i} />)}</div></div>
        <div className="hud-time"><span className="micro-label">TIEMPO</span><Reloj segundos={snapshot.elapsed} /></div>
        <div className="hud-lives"><span className="micro-label">ESCUDOS</span><div aria-label={`${snapshot.lives} de 3 vidas`}>{[0, 1, 2].map(i => <Icon name="shield" className={i < snapshot.lives ? 'life-active' : 'life-empty'} key={i} />)}</div></div>
        <button className="icon-button pause-button" onClick={pause} aria-label="Pausar partida" title="Pausar (Esc / P)"><Icon name="pause" /></button>
      </section>
      <div className="game-surface" ref={surfaceRef}>
        <canvas ref={canvasRef} className="game-canvas" tabIndex={inMission && !isModal ? 0 : -1} aria-label="Campo de juego Space Invaders. Flechas o A y D para moverte, espacio para disparar, Escape para pausar." inert={isModal} />
        <div className="field-topline" aria-hidden="true"><span><i /> {phase === 'paused' ? 'SEÑAL EN ESPERA' : 'DEFENSA ACTIVA'}</span><span>{snapshot.remaining} OBJETIVOS RESTANTES</span></div>
        {(phase === 'countdown' || phase === 'wave') && <div className="transition-overlay" role="status"><span className="eyebrow">{phase === 'wave' ? `OLEADA ${snapshot.wave} COMPLETADA · +${snapshot.wave * 250} PTS` : 'BOLIVIA, TENEMOS UNA MISIÓN'}</span><strong className={phase === 'wave' ? 'wave-cleared' : 'countdown-number'}>{phase === 'wave' ? 'Cielo despejado.' : snapshot.countdown || 1}</strong><p>{phase === 'wave' ? 'Siguiente oleada en camino. Recuperas un escudo.' : 'Prepara tus piedras.'}</p></div>}
        {isModal && <div className="modal-backdrop"><div className="game-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" onKeyDown={event => {
          if (event.key !== 'Tab') return
          const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button')
          if (!buttons?.length) return
          if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus() }
          else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus() }
        }}>
          <span className={`dialog-emblem ${phase === 'gameover' ? 'emblem-lost' : ''}`}><Icon name={phase === 'paused' ? 'pause' : phase === 'victory' ? 'trophy' : 'shield'} /></span>
          <span className="eyebrow">{phase === 'paused' ? 'SEÑAL EN ESPERA' : phase === 'victory' ? 'MISIÓN CUMPLIDA' : 'MISIÓN INTERRUMPIDA'}</span>
          <h2 id="dialog-title">{phase === 'paused' ? 'Respira, piloto.' : phase === 'victory' ? '¡Jallalla, Bolivia!' : 'Volveremos al cielo.'}</h2>
          <p id="dialog-description">{phase === 'paused' ? 'El universo puede esperar. Tu misión continúa justo donde la dejaste.' : snapshot.reason}</p>
          <div className="result-stats"><div><span className="micro-label">PUNTAJE</span><strong>{formatScore(snapshot.score)}</strong></div><div><span className="micro-label">TIEMPO</span><Reloj segundos={snapshot.elapsed} /></div><div><span className="micro-label">OLEADA</span><strong>{snapshot.wave} / 5</strong></div></div>
          {phase !== 'paused' && snapshot.score > previousBest && <div className="new-record"><Icon name="trophy" /> NUEVO RÉCORD PERSONAL</div>}
          {phase !== 'paused' && <p className="result-detail">{snapshot.kills} invasores derribados · {snapshot.shots} piedras lanzadas</p>}
          <button className="primary-button" onClick={phase === 'paused' ? resume : start}><Icon name={phase === 'paused' ? 'play' : 'restart'} />{phase === 'paused' ? 'Continuar misión' : 'Volver a jugar'}<Icon name="arrow" /></button>
          {phase === 'paused' && <button className="secondary-button" onClick={start}><Icon name="restart" /> Reiniciar misión</button>}
          <button className="text-button" onClick={goHome}><Icon name="home" /> Volver al inicio</button>
          {phase === 'paused' && <span className="dialog-hint">ESC O P PARA CONTINUAR</span>}
        </div></div>}
      </div>
      <div className="mission-bottom" inert={isModal}>
        <div className="wave-progress"><span className="micro-label">SECTOR {String(snapshot.wave).padStart(2, '0')}</span><div role="progressbar" aria-label="Progreso de la oleada" aria-valuemin={0} aria-valuemax={snapshot.waveTotal} aria-valuenow={snapshot.waveTotal - snapshot.remaining}><span style={{ width: `${snapshot.waveTotal ? (1 - snapshot.remaining / snapshot.waveTotal) * 100 : 0}%` }} /></div><span>{snapshot.waveTotal - snapshot.remaining}/{snapshot.waveTotal}</span></div>
        <Controls compact />
        <div className="touch-controls" aria-label="Controles táctiles"><div>{(['left', 'right'] as const).map(control => <button key={control} className="touch-button" aria-label={control === 'left' ? 'Mover a la izquierda' : 'Mover a la derecha'} onPointerDown={event => hold(event, control)} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><Icon name={control} /></button>)}</div><span className="touch-control-label">MANTÉN PARA<br />MOVER Y DISPARAR</span><button className="touch-button fire-button" aria-label="Disparar piedras" onPointerDown={event => hold(event, 'fire')} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><Icon name="target" /> FUEGO</button></div>
      </div>
    </main>
    <footer className="app-footer"><span><span className="bolivia-flag" /> DESDE BOLIVIA. HACIA LAS ESTRELLAS.</span><span>UN JUGADOR <span className="footer-dot">·</span> INFINITAS GANAS</span></footer>
    <div className="sr-only" role="status" aria-live="polite">{phase === 'playing' ? `Oleada ${snapshot.wave}. ${snapshot.lives} vidas.` : ''}</div>
  </div>
}
