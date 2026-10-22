import type { ThemeColors } from "@/hooks/use-theme-colors"
import type { GraphSettings } from "@/lib/graph-settings"
import type { GraphNode } from "@/lib/world-graph"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { Emphasis } from "./graph-emphasis"
import type { Frame } from "./graph-frame"
import { drawLabel, labelFade } from "./graph-label"
import { coverOf, iconOf, spriteAt } from "./graph-sprites"

const LINK_ALPHA = 0.45
// The icon of a kind, as a share of the dot's radius.
const ICON_SIZE = 1.3

export type GraphView = {
  emphasis: Emphasis
  frame: Frame
  colors: ThemeColors
  settings: GraphSettings
  // Only a campaign has hidden entries; a library has none.
  marksHidden: boolean
  // Asks for a redraw once a picture has arrived.
  refresh: () => void
}

// A dot a little bigger for each connection, as the settings scale it.
export const radiusOf = (node: GraphNode, size: number) =>
  (5 + Math.min(node.degree, 10) * 0.4) * size

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, width: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.lineWidth = width
  ctx.strokeStyle = color
  ctx.stroke()
}

// The cover of the entry fills the dot; without one, the icon of its kind sits in it.
function drawSprite(ctx: CanvasRenderingContext2D, node: GraphNode, x: number, y: number, r: number, scale: number, view: GraphView) {
  const across = 2 * r * scale * window.devicePixelRatio
  const url = node.entry.imageUrl
  const cover = url ? coverOf(url, view.refresh) : null
  if (cover) {
    ctx.drawImage(spriteAt(cover, across), x - r, y - r, 2 * r, 2 * r)
    return
  }
  const icon = iconOf(node.entry.kind, view.refresh)
  if (!icon) return
  const side = r * ICON_SIZE
  ctx.drawImage(spriteAt(icon, across * (ICON_SIZE / 2)), x - side / 2, y - side / 2, side, side)
}

// An entry as a dot in the colour of its kind, with its cover or kind icon inside at
// every zoom. The hovered entry and the ones next to it take the accent colour and
// the rest dim; a selected one has a ring and a search hit a thinner one. Names sit
// under the dots and fade in with the zoom. A hidden entry (to a GM) is faded and has
// a dashed ring.
export function drawNode(node: GraphNode, ctx: CanvasRenderingContext2D, scale: number, view: GraphView) {
  const { colors, settings, emphasis } = view
  const x = node.x ?? 0
  const y = node.y ?? 0
  const look = emphasis.look(node.id)
  if (look.alpha < 0.01 || !view.frame.sees(x, y)) return

  const r = radiusOf(node, settings.nodeSize)
  const tint = WORLD_KINDS[node.entry.kind].tint
  const hidden = view.marksHidden && !node.entry.revealed
  const alpha = look.alpha * (hidden ? 0.6 : 1)

  ctx.save()
  ctx.globalAlpha = alpha
  disc(ctx, x, y, r, tint)
  if (look.lit > 0) {
    ctx.globalAlpha = alpha * look.lit
    disc(ctx, x, y, r, colors.primary)
    ring(ctx, x, y, r + 1 / scale, 1.5 / scale, colors.primary)
    ctx.globalAlpha = alpha
  }
  drawSprite(ctx, node, x, y, r, scale, view)

  if (hidden) {
    ctx.setLineDash([2 / scale, 1.5 / scale])
    ring(ctx, x, y, r + 2 / scale, 1 / scale, tint)
    ctx.setLineDash([])
  }
  if (look.pick > 0) {
    ctx.globalAlpha = alpha * look.pick
    ring(ctx, x, y, r + 3.5 / scale, 2 / scale, colors.primary)
  }
  if (look.match > 0) {
    ctx.globalAlpha = alpha * look.match
    ring(ctx, x, y, r + 2.5 / scale, 1.5 / scale, colors.foreground)
  }

  const shown = Math.max(labelFade(scale, settings.labelThreshold), look.lit, look.pick, look.match)
  if (alpha * shown > 0.02) {
    ctx.globalAlpha = alpha * shown
    drawLabel(ctx, node.entry.name, x, y, r, scale, colors)
  }
  ctx.restore()
}

let dashedAt = 0
let dashed: number[] = []

// The same dash array for every line of a frame.
function dashFor(scale: number) {
  if (dashedAt !== scale) {
    dashedAt = scale
    dashed = [4 / scale, 3 / scale]
  }
  return dashed
}

// A line between two entries, as thin on screen at any zoom: solid for a mention,
// dashed for pins. The ones from the hovered entry take the accent colour.
export function drawLink(
  link: { source?: unknown; target?: unknown; mention: boolean },
  ctx: CanvasRenderingContext2D,
  scale: number,
  view: GraphView
) {
  const from = link.source as GraphNode
  const to = link.target as GraphNode
  if (typeof from !== "object" || typeof to !== "object" || from.x == null || to.x == null) return
  const ay = from.y ?? 0
  const by = to.y ?? 0
  if (view.frame.misses(from.x, ay, to.x, by)) return

  const { lit, alpha } = view.emphasis.link(from.id, to.id)
  if (alpha < 0.01) return

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(from.x, ay)
  ctx.lineTo(to.x, by)
  ctx.lineWidth = (0.8 * view.settings.lineThickness) / scale
  if (!link.mention) ctx.setLineDash(dashFor(scale))
  ctx.globalAlpha = LINK_ALPHA * alpha
  ctx.strokeStyle = view.colors.mutedForeground
  ctx.stroke()
  if (lit > 0) {
    ctx.globalAlpha = alpha * lit
    ctx.lineWidth *= 2
    ctx.strokeStyle = view.colors.primary
    ctx.stroke()
  }
  ctx.restore()
}
