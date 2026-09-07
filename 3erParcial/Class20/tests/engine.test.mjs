import test from 'node:test'
import assert from 'node:assert/strict'
import { GameEngine, TOTAL_WAVES } from '../src/game/engine.ts'

const idle = { left: false, right: false, fire: false }
const advance = (game, seconds, input = idle, fps = 120) => {
  for (let i = 0; i < Math.round(seconds * fps); i++) game.update(1 / fps, input)
}
const playing = () => {
  const game = new GameEngine(960, () => 0.5)
  game.start()
  advance(game, 3)
  assert.equal(game.phase, 'playing')
  return game
}
const enemy = (id, x = 200, y = 200, health = 1) => ({ id, column: id, x, y, width: 46, height: 50, health, maxHealth: health })
const stone = (x, y, vy = -650) => ({ x, y, width: 14, height: 24, vx: 0, vy })
const enemyShot = game => ({ x: game.player.x + 30, y: game.player.y + 25, width: 8, height: 19, vx: 0, vy: 180 })

test('el menú y la cuenta regresiva no consumen tiempo de partida', () => {
  const game = new GameEngine()
  advance(game, 5, { ...idle, fire: true, left: true })
  assert.equal(game.elapsed, 0)
  assert.equal(game.shots, 0)
  game.start()
  advance(game, 2, { ...idle, fire: true })
  assert.equal(game.phase, 'countdown')
  assert.equal(game.elapsed, 0)
  assert.equal(game.shots, 0)
})

test('pausar congela toda la simulación y reanuda la fase correcta', () => {
  for (const phase of ['countdown', 'playing', 'wave']) {
    const game = playing()
    advance(game, 0.3, { ...idle, fire: true })
    game.phase = phase
    game.countdown = 1.5
    game.pause()
    const frozen = JSON.stringify(game)
    advance(game, 15, { left: true, right: false, fire: true })
    assert.equal(JSON.stringify(game), frozen)
    game.resume()
    assert.equal(game.phase, phase)
    advance(game, 0.25)
    assert.notEqual(JSON.stringify(game), frozen)
  }
})

test('movimiento y cadencia consistentes a 30, 60 y 144 FPS', () => {
  const results = [30, 60, 144].map(fps => {
    const game = playing()
    advance(game, 0.5, { ...idle, right: true, fire: true }, fps)
    return { x: game.player.x, shots: game.shots, time: game.elapsed }
  })
  for (const result of results) {
    assert.ok(Math.abs(result.x - results[0].x) < 0.01)
    assert.equal(result.shots, results[0].shots)
    assert.ok(Math.abs(result.time - 0.5) < 0.01)
  }
})

test('la nave respeta los bordes y las direcciones opuestas se cancelan', () => {
  const game = playing()
  advance(game, 3, { ...idle, left: true })
  assert.equal(game.player.x, 12)
  advance(game, 3, { ...idle, right: true })
  assert.equal(game.player.x, game.width - game.player.width - 12)
  const x = game.player.x
  advance(game, 1, { ...idle, right: true, left: true })
  assert.equal(game.player.x, x)
})

test('mantener disparo produce piedras limitadas por la cadencia', () => {
  const game = playing()
  advance(game, 2, { ...idle, fire: true })
  assert.ok(game.shots >= 10 && game.shots <= 11)
  const shots = game.shots
  advance(game, 2)
  assert.equal(game.shots, shots)
  assert.equal(game.stones.length, 0)
})

test('una piedra rápida no atraviesa un enemigo ni mata dos a la vez', () => {
  const game = playing()
  game.enemies = [enemy(0, 200, 200), enemy(1, 200, 200)]
  game.stones = [stone(217, 270, -12000)]
  game.update(1 / 120, idle)
  assert.equal(game.enemies.length, 1)
  assert.equal(game.score, 100)
  assert.equal(game.kills, 1)
  assert.equal(game.stones.length, 0)
})

test('dos piedras en un enemigo no duplican la puntuación', () => {
  const game = playing()
  game.enemies = [enemy(0), enemy(1, 500)]
  game.stones = [stone(217, 220), stone(217, 220)]
  game.update(1 / 120, idle)
  assert.equal(game.score, 100)
  assert.equal(game.kills, 1)
  assert.equal(game.enemies.length, 1)
})

test('los enemigos acorazados requieren dos impactos', () => {
  const game = playing()
  game.enemies = [enemy(0, 200, 200, 2), enemy(1, 500)]
  game.stones = [stone(217, 220)]
  game.update(1 / 120, idle)
  assert.equal(game.enemies[0].health, 1)
  assert.equal(game.score, 0)
  game.stones = [stone(217, 220)]
  game.update(1 / 120, idle)
  assert.equal(game.score, 150)
})

test('el daño activa invulnerabilidad y tres impactos separados causan derrota', () => {
  const game = playing()
  game.enemyShots = [enemyShot(game), enemyShot(game)]
  game.update(1 / 120, idle)
  assert.equal(game.lives, 2)
  assert.ok(game.invulnerable > 2)
  game.enemyShots = [enemyShot(game)]
  game.update(1 / 120, idle)
  assert.equal(game.lives, 2)
  for (let i = 0; i < 2; i++) {
    game.invulnerable = 0
    game.enemyShots = [enemyShot(game)]
    game.update(1 / 120, idle)
  }
  assert.equal(game.lives, 0)
  assert.equal(game.phase, 'gameover')
})

test('cruzar la defensa produce derrota aunque queden escudos', () => {
  const game = playing()
  game.enemies = [enemy(0, 200, 590)]
  game.update(1 / 120, idle)
  assert.equal(game.phase, 'gameover')
  assert.match(game.reason, /línea de defensa/)
})

test('cinco oleadas terminan en victoria con transición y bonificación', () => {
  const game = playing()
  game.lives = 2
  for (let wave = 1; wave <= TOTAL_WAVES; wave++) {
    assert.equal(game.wave, wave)
    const total = game.enemies.length
    for (let hit = 0; hit < 2 && game.phase === 'playing'; hit++) {
      game.stones = game.enemies.map(target => stone(target.x + 17, target.y + 15, 0))
      game.update(1 / 120, idle)
    }
    assert.ok(total >= 12)
    if (wave < TOTAL_WAVES) {
      assert.equal(game.phase, 'wave')
      assert.equal(game.enemyShots.length, 0)
      const time = game.elapsed
      advance(game, 2.4)
      assert.equal(game.phase, 'playing')
      assert.ok(Math.abs(game.elapsed - time) < 0.01)
      assert.equal(game.lives, 3)
    }
  }
  assert.equal(game.phase, 'victory')
  assert.equal(game.kills, 96)
  assert.ok(game.score >= 14850)
  const frozen = JSON.stringify(game)
  advance(game, 10, { ...idle, fire: true })
  assert.equal(JSON.stringify(game), frozen)
})

test('reiniciar restablece todos los estados de la partida', () => {
  const game = playing()
  advance(game, 4, { ...idle, fire: true, left: true })
  game.score = 8400
  game.lives = 1
  game.wave = 4
  game.pause()
  game.start()
  const fresh = new GameEngine(960, () => 0.5)
  fresh.start()
  assert.equal(JSON.stringify(game), JSON.stringify(fresh))
})

test('cambiar resolución conserva la partida y mantiene entidades dentro del campo', () => {
  const game = playing()
  advance(game, 0.2, { ...idle, fire: true, right: true })
  const stats = game.snapshot()
  for (const width of [480, 1440, 720, 390]) {
    game.resize(width)
    for (const body of [game.player, ...game.enemies, ...game.stones]) {
      assert.ok(body.x >= 0)
      assert.ok(body.x + body.width <= game.width)
    }
    assert.deepEqual(game.snapshot(), stats)
  }
})

test('los retrasos grandes no teletransportan entidades ni recuperan tiempo oculto', () => {
  const game = playing()
  game.update(30, { ...idle, right: true })
  assert.ok(game.elapsed <= 0.101)
  const before = JSON.stringify(game)
  for (const delta of [NaN, Infinity, -1, 0]) game.update(delta, idle)
  assert.equal(JSON.stringify(game), before)
})
