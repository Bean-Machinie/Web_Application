import type { ThemeColors } from "@/hooks/use-theme-colors"

// How far past its threshold the zoom has to go for names to be fully there.
const LABEL_FADE = 0.6
// The gap between a dot and its name, on screen.
const GAP = 3

const clamp = (value: number) => Math.min(1, Math.max(0, value))

// 0 below the threshold, 1 fully past it, eased in between.
export function labelFade(scale: number, threshold: number) {
  const t = clamp((scale - threshold) / LABEL_FADE)
  return t * t * (3 - 2 * t)
}

// The name under a dot. The text is drawn at a fixed size on screen whatever the
// zoom, and has a halo in the background colour to stay readable over lines.
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  r: number,
  scale: number,
  colors: ThemeColors
) {
  ctx.save()
  ctx.translate(x, y + r + GAP / scale)
  ctx.scale(1 / scale, 1 / scale)
  ctx.font = "500 11px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  ctx.lineWidth = 3
  ctx.lineJoin = "round"
  ctx.strokeStyle = colors.background
  ctx.strokeText(name, 0, 0)
  ctx.fillStyle = colors.foreground
  ctx.fillText(name, 0, 0)
  ctx.restore()
}
