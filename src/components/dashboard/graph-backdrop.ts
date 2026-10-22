import type { ThemeColors } from "@/hooks/use-theme-colors"

// Dots of a grid, in graph units. They move and scale with the graph, like a table
// the entries lie on.
const SPACING = 28
// Every fifth dot is a little bigger, which gives the grid a sense of scale.
const MAJOR = 5
// On screen, the grid fades out below this spacing and is fully there at twice it.
const FADE_FROM = 10
const DOT_ALPHA = 0.5
// Past this many dots the grid is not worth drawing.
const MAX_DOTS = 6000
// How far the pointer's glow reaches, on screen.
const SPOT_REACH = 170
// A band of light crosses the grid slowly; this is how fast and how wide.
const WAVE_SPEED = 0.0007
const WAVE_WIDTH = 0.0035

// Where the pointer is, in graph units.
export type Spot = { x: number; y: number; on: boolean }

const clamp = (value: number) => Math.min(1, Math.max(0, value))

// The dot grid behind the graph, over the part of it that is on screen. A band of
// light drifts across it, and the dots near the pointer swell and take the accent
// colour.
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  scale: number,
  area: { left: number; top: number; right: number; bottom: number },
  colors: ThemeColors,
  spot: Spot,
  time: number
) {
  const fade = clamp((SPACING * scale - FADE_FROM) / FADE_FROM)
  if (fade === 0) return
  const first = Math.floor(area.left / SPACING)
  const last = Math.ceil(area.right / SPACING)
  const above = Math.floor(area.top / SPACING)
  const below = Math.ceil(area.bottom / SPACING)
  if ((last - first) * (below - above) > MAX_DOTS) return

  const minor = 1.8 / scale
  const reach = SPOT_REACH / scale
  const drift = time * WAVE_SPEED
  let accent = false
  ctx.save()
  ctx.fillStyle = colors.mutedForeground
  for (let column = first; column <= last; column += 1) {
    for (let row = above; row <= below; row += 1) {
      const x = column * SPACING
      const y = row * SPACING
      const band = Math.max(0, Math.sin((x + y) * WAVE_WIDTH - drift)) ** 3
      let size = (column % MAJOR === 0 && row % MAJOR === 0 ? minor * 1.7 : minor) * (1 + 0.4 * band)
      let alpha = DOT_ALPHA * (0.55 + 0.45 * band)

      const near = spot.on ? 1 - Math.hypot(x - spot.x, y - spot.y) / reach : 0
      const glow = near > 0 ? near * near : 0
      if (glow > 0) {
        size *= 1 + 1.8 * glow
        alpha = Math.min(1, alpha + 0.6 * glow)
      }
      if ((glow > 0.02) !== accent) {
        accent = !accent
        ctx.fillStyle = accent ? colors.primary : colors.mutedForeground
      }
      ctx.globalAlpha = alpha * fade
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }
  }
  ctx.restore()
}
