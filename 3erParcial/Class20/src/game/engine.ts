export const WORLD_HEIGHT = 720
export const TOTAL_WAVES = 5
export const WAVE_NAMES = ['Primer contacto', 'Órbita hostil', 'Cinturón de fuego', 'Última frontera', 'La resistencia']
export type Phase = 'menu' | 'countdown' | 'playing' | 'paused' | 'wave' | 'victory' | 'gameover'
export type SoundEvent = 'shot' | 'hit' | 'damage' | 'wave' | 'victory' | 'gameover'
export type Body = { x: number; y: number; width: number; height: number }
export type Enemy = Body & { id: number; column: number; health: number; maxHealth: number }
export type Projectile = Body & { vx: number; vy: number }
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }
export type Input = { left: boolean; right: boolean; fire: boolean }
export type Snapshot = {
  phase: Phase; score: number; elapsed: number; lives: number; wave: number;
  remaining: number; waveTotal: number; countdown: number; combo: number;
  kills: number; shots: number; reason: string;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
export function overlaps(a: Body, b: Body) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
function hitbox(body: Body, inset: number): Body {
  return { x: body.x + body.width * inset, y: body.y + body.height * inset, width: body.width * (1 - inset * 2), height: body.height * (1 - inset * 2) }
}
function sweptBody(body: Body, previousY: number): Body {
  return { ...body, y: Math.min(previousY, body.y), height: body.height + Math.abs(previousY - body.y) }
}

export class GameEngine {
  width: number
  phase: Phase = 'menu'
  private resumePhase: Phase = 'playing'
  player: Body = { x: 0, y: 618, width: 66, height: 60 }
  enemies: Enemy[] = []
  stones: Projectile[] = []
  enemyShots: Projectile[] = []
  particles: Particle[] = []
  events: SoundEvent[] = []
  score = 0
  elapsed = 0
  animationTime = 0
  lives = 3
  wave = 1
  waveTotal = 0
  countdown = 3
  invulnerable = 0
  combo = 1
  comboTime = 0
  kills = 0
  shots = 0
  reason = ''
  private killStreak = 0
  private shotCooldown = 0
  private enemyCooldown = 1.8
  private direction = 1
  private nextId = 0
  private random: () => number

  constructor(width = 960, random: () => number = Math.random) {
    this.width = clamp(width, 480, 1440)
    this.random = random
    this.player.x = (this.width - this.player.width) / 2
  }

  start() {
    this.phase = 'countdown'
    this.resumePhase = 'countdown'
    this.score = this.elapsed = this.animationTime = this.kills = this.shots = this.killStreak = 0
    this.combo = this.wave = 1
    this.lives = this.countdown = 3
    this.invulnerable = this.comboTime = this.shotCooldown = 0
    this.reason = ''
    this.nextId = 0
    this.stones = []
    this.enemyShots = []
    this.particles = []
    this.events = []
    this.player.x = (this.width - this.player.width) / 2
    this.createWave()
  }

  menu() {
    this.phase = 'menu'
    this.events = []
  }

  pause() {
    if (this.phase === 'playing' || this.phase === 'countdown' || this.phase === 'wave') {
      this.resumePhase = this.phase
      this.phase = 'paused'
      this.events = []
    }
  }

  resume() {
    if (this.phase === 'paused') this.phase = this.resumePhase
  }

  resize(width: number) {
    const nextWidth = clamp(width, 480, 1440)
    const ratio = nextWidth / this.width
    for (const body of [this.player, ...this.enemies, ...this.stones, ...this.enemyShots]) {
      body.x = clamp((body.x + body.width / 2) * ratio - body.width / 2, 0, nextWidth - body.width)
    }
    for (const particle of this.particles) particle.x *= ratio
    this.width = nextWidth
  }

  snapshot(): Snapshot {
    return { phase: this.phase, score: this.score, elapsed: this.elapsed, lives: this.lives, wave: this.wave, remaining: this.enemies.length, waveTotal: this.waveTotal, countdown: Math.ceil(this.countdown), combo: this.combo, kills: this.kills, shots: this.shots, reason: this.reason }
  }

  drainEvents() {
    const events = this.events
    this.events = []
    return events
  }

  update(delta: number, input: Input) {
    if (!Number.isFinite(delta) || delta <= 0) return
    let remaining = Math.min(delta, 0.1)
    while (remaining > 0.000001) {
      const step = Math.min(remaining, 1 / 120)
      this.step(step, input)
      remaining -= step
    }
  }

  private createWave() {
    const rows = 2 + Math.floor(this.wave / 2)
    const spacing = this.width * 0.112
    this.enemies = []
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < 6; column++) {
        const health = this.wave >= 3 && row === 0 ? 2 : 1
        this.enemies.push({ id: this.nextId++, column, x: this.width / 2 + (column - 2.5) * spacing - 23, y: 60 + row * 66 + (this.wave % 2 === 0 ? Math.abs(column - 2.5) * 12 : 0), width: 46, height: 50, health, maxHealth: health })
      }
    }
    this.waveTotal = this.enemies.length
    this.enemyCooldown = 1.8
    this.direction = this.wave % 2 ? 1 : -1
    this.stones = []
    this.enemyShots = []
  }

  private burst(x: number, y: number, color: string, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = this.random() * Math.PI * 2
      const speed = 30 + this.random() * 145
      const life = 0.3 + this.random() * 0.5
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, color, size: 1 + this.random() * 3 })
    }
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180)
  }

  private damage() {
    if (this.invulnerable > 0) return
    this.lives--
    this.invulnerable = 2.2
    this.combo = 1
    this.killStreak = this.comboTime = 0
    this.burst(this.player.x + this.player.width / 2, this.player.y + 25, '#ff977c', 28)
    this.events.push('damage')
    if (this.lives <= 0) this.finish('gameover', 'Tu nave se quedó sin escudos. La resistencia te espera para un nuevo intento.')
  }

  private finish(phase: 'victory' | 'gameover', reason: string) {
    this.phase = phase
    this.reason = reason
    this.events.push(phase)
  }

  private step(dt: number, input: Input) {
    if (this.phase !== 'playing' && this.phase !== 'countdown' && this.phase !== 'wave') return
    this.animationTime += dt
    for (const particle of this.particles) {
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.life -= dt
    }
    this.particles = this.particles.filter(particle => particle.life > 0)
    if (this.phase === 'countdown' || this.phase === 'wave') {
      this.countdown = Math.max(0, this.countdown - dt)
      if (this.countdown <= 0.00001) {
        if (this.phase === 'wave') {
          this.wave++
          this.lives = Math.min(3, this.lives + 1)
          this.createWave()
          this.invulnerable = 1.5
        }
        this.phase = 'playing'
      }
      return
    }

    this.elapsed += dt
    this.invulnerable = Math.max(0, this.invulnerable - dt)
    this.comboTime = Math.max(0, this.comboTime - dt)
    if (this.comboTime === 0) { this.combo = 1; this.killStreak = 0 }
    const movement = Number(input.right) - Number(input.left)
    this.player.x = clamp(this.player.x + movement * Math.max(340, this.width * 0.65) * dt, 12, this.width - this.player.width - 12)
    this.shotCooldown = Math.max(0, this.shotCooldown - dt)
    if (input.fire && this.shotCooldown <= 0) {
      this.stones.push({ x: this.player.x + this.player.width / 2 - 7, y: this.player.y - 16, width: 14, height: 24, vx: 0, vy: -650 })
      this.shotCooldown = 0.19
      this.shots++
      this.events.push('shot')
    }

    const speed = (29 + this.wave * 8 + (1 - this.enemies.length / this.waveTotal) * 42) * this.width / 960
    const advance = this.direction * speed * dt
    if (this.enemies.some(enemy => enemy.x + advance < 18 || enemy.x + enemy.width + advance > this.width - 18)) {
      this.direction *= -1
      for (const enemy of this.enemies) enemy.y += 20
    } else {
      for (const enemy of this.enemies) enemy.x += advance
    }

    for (const stone of this.stones) {
      const previousY = stone.y
      stone.y += stone.vy * dt
      const enemy = this.enemies.find(target => target.health > 0 && overlaps(sweptBody(stone, previousY), hitbox(target, 0.12)))
      if (!enemy) continue
      stone.y = -100
      enemy.health--
      this.burst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.health ? '#f8d575' : '#b8a0ff', enemy.health ? 6 : 18)
      this.events.push('hit')
      if (enemy.health === 0) {
        this.killStreak++
        this.combo = Math.min(4, 1 + Math.floor(this.killStreak / 4))
        this.comboTime = 3
        this.score += (enemy.maxHealth === 2 ? 150 : 100) * this.combo
        this.kills++
      }
    }
    this.enemies = this.enemies.filter(enemy => enemy.health > 0)
    this.stones = this.stones.filter(stone => stone.y + stone.height > 0)

    this.enemyCooldown -= dt
    if (this.enemyCooldown <= 0 && this.enemies.length > 0) {
      const front = [...new Set(this.enemies.map(enemy => enemy.column))].map(column => this.enemies.filter(enemy => enemy.column === column).reduce((a, b) => a.y > b.y ? a : b))
      const shots = this.wave >= 4 ? 2 : 1
      for (let i = 0; i < Math.min(shots, front.length); i++) {
        const index = Math.floor(this.random() * front.length)
        const [enemy] = front.splice(index, 1)
        const x = enemy.x + enemy.width / 2
        this.enemyShots.push({ x: x - 4, y: enemy.y + enemy.height, width: 8, height: 19, vx: clamp((this.player.x + this.player.width / 2 - x) * 0.18, -65, 65), vy: 160 + this.wave * 22 })
      }
      this.enemyCooldown = 1.35 - this.wave * 0.12 + this.random() * 0.3
    }
    for (const shot of this.enemyShots) {
      const previousY = shot.y
      shot.x += shot.vx * dt
      shot.y += shot.vy * dt
      if (overlaps(sweptBody(shot, previousY), hitbox(this.player, 0.23))) {
        shot.y = WORLD_HEIGHT + 100
        this.damage()
      }
    }
    this.enemyShots = this.enemyShots.filter(shot => shot.y < WORLD_HEIGHT && shot.x > -20 && shot.x < this.width + 20)
    if (this.phase !== 'playing') return
    if (this.enemies.some(enemy => enemy.y + enemy.height >= this.player.y + 12)) {
      this.finish('gameover', 'Los invasores cruzaron la línea de defensa. Intercéptalos antes de que lleguen a tu nave.')
      return
    }
    if (this.enemies.length === 0) {
      this.score += this.wave * 250
      this.stones = []
      this.enemyShots = []
      if (this.wave === TOTAL_WAVES) {
        this.score += this.lives * 500
        this.finish('victory', 'Cinco oleadas. Una sola resistencia. El cielo boliviano vuelve a estar a salvo.')
      } else {
        this.phase = 'wave'
        this.countdown = 2.4
        this.events.push('wave')
      }
    }
  }
}
