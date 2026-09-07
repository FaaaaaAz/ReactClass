import { GameEngine, WORLD_HEIGHT } from './engine'

export type Sprites = { player: HTMLImageElement; alien: HTMLImageElement; stone: HTMLImageElement }

function drawSprite(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const w = image.naturalWidth * scale
  const h = image.naturalHeight * scale
  ctx.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h)
}

export function renderGame(ctx: CanvasRenderingContext2D, game: GameEngine, sprites: Sprites, reducedMotion: boolean) {
  const canvas = ctx.canvas
  const scale = Math.min(canvas.width / game.width, canvas.height / WORLD_HEIGHT)
  const offsetX = (canvas.width - game.width * scale) / 2
  const offsetY = (canvas.height - WORLD_HEIGHT * scale) / 2
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, game.width, WORLD_HEIGHT)
  ctx.clip()

  for (let i = 0; i < 65; i++) {
    const x = ((i * 7919) % 997) / 997 * game.width
    const y = ((i * 1307) % 719 + (reducedMotion ? 0 : game.animationTime * (4 + i % 4))) % WORLD_HEIGHT
    ctx.fillStyle = i % 4 === 0 ? '#92b5c080' : '#d4e8ff35'
    ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1)
  }
  ctx.strokeStyle = '#a4efd72b'
  ctx.setLineDash([5, 9])
  ctx.beginPath()
  ctx.moveTo(12, 690)
  ctx.lineTo(game.width - 12, 690)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#a3b9b678'
  ctx.font = '9px ui-monospace, monospace'
  ctx.fillText('LÍNEA DE DEFENSA / BOLIVIA', 15, 710)

  for (const enemy of game.enemies) {
    drawSprite(ctx, sprites.alien, enemy.x, enemy.y, enemy.width, enemy.height)
    if (enemy.maxHealth > 1) {
      ctx.fillStyle = '#293044'
      ctx.fillRect(enemy.x + 11, enemy.y - 7, 24, 3)
      ctx.fillStyle = '#f8d575'
      ctx.fillRect(enemy.x + 11, enemy.y - 7, 24 * enemy.health / enemy.maxHealth, 3)
    }
  }
  for (const stone of game.stones) drawSprite(ctx, sprites.stone, stone.x - 9, stone.y - 5, 32, 48)
  ctx.shadowBlur = reducedMotion ? 0 : 12
  ctx.shadowColor = '#ec9dff'
  for (const shot of game.enemyShots) {
    ctx.fillStyle = '#c784fc'
    ctx.beginPath()
    ctx.roundRect(shot.x, shot.y, shot.width, shot.height, 4)
    ctx.fill()
    ctx.fillStyle = '#f6dfff'
    ctx.fillRect(shot.x + 3, shot.y + 3, 2, shot.height - 6)
  }
  ctx.shadowBlur = 0
  const player = game.player
  if (game.invulnerable > 0) {
    ctx.strokeStyle = '#a4f3d9'
    ctx.fillStyle = '#a4f3d910'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.ellipse(player.x + player.width / 2, player.y + 28, 44, 44, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.globalAlpha = reducedMotion ? 0.85 : 0.65 + Math.sin(game.animationTime * 14) * 0.25
  }
  drawSprite(ctx, sprites.player, player.x, player.y, player.width, player.height)
  ctx.globalAlpha = 1
  if (!reducedMotion) {
    for (const particle of game.particles) {
      ctx.globalAlpha = particle.life / particle.maxLife
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
    }
    ctx.globalAlpha = 1
  }
  ctx.restore()
}
