import type { ThemeColors } from "@/hooks/use-theme-colors"
import type { GraphSettings } from "@/lib/graph-settings"
import type { GraphNode } from "@/lib/world-graph"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { Hover } from "./graph-hover"

// The picture of an entry shows inside its dot only once zoomed in this far, fading
// in between the two.
const IMAGE_FROM = 3
const IMAGE_FULL = 4
// How far past its threshold the zoom has to go for names to be fully there.
const LABEL_FADE = 0.6
// How much the entries and lines that are not lit are dimmed.
const DIM_NODES = 0.82
const DIM_LINES = 0.85

export type GraphView = {
  hover: Hover
  near: ReadonlyMap<string, ReadonlySet<string>>
  colors: ThemeColors
  settings: GraphSettings
  // Only a campaign has hidden entries; a library has none.
  marksHidden: boolean
  // Asks for a redraw once a picture has arrived.
  refresh: () => void
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const mixIn = (accent: string, percent: number, base: string) =>
  `color-mix(in oklab, ${accent} ${Math.round(percent * 100)}%, ${base})`

// A dot a little bigger for each connection, as the settings scale it.
export const radiusOf = (node: GraphNode, size: number) =>
  (3.5 + Math.min(node.degree, 10) * 0.35) * size

// Pictures are loaded once, when first needed, and the graph is redrawn when they
// arrive. A picture that fails is not asked for again.
const pictures = new Map<string, HTMLImageElement | null>()

function picture(url: string, refresh: () => void) {
  if (pictures.has(url)) return pictures.get(url)
  const image = new Image()
  image.onload = refresh
  image.onerror = () => pictures.set(url, null)
  image.src = url
  pictures.set(url, image)
  return image
}

function drawPicture(ctx: CanvasRenderingContext2D, node: GraphNode, r: number, alpha: number, view: GraphView) {
  const url = node.entry.imageUrl
  const image = url ? picture(url, view.refresh) : null
  if (!image?.complete || image.naturalWidth === 0) return

  // The middle square of the picture, so it fills the dot.
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.beginPath()
  ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI)
  ctx.clip()
  ctx.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    (node.x ?? 0) - r,
    (node.y ?? 0) - r,
    2 * r,
    2 * r
  )
  ctx.restore()
}

function drawLabel(ctx: CanvasRenderingContext2D, node: GraphNode, r: number, scale: number, view: GraphView) {
  ctx.font = `500 ${11 / scale}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  const x = node.x ?? 0
  const y = (node.y ?? 0) + r + 2 / scale
  // A halo in the background colour keeps the name readable over lines.
  ctx.lineWidth = 3 / scale
  ctx.lineJoin = "round"
  ctx.strokeStyle = view.colors.background
  ctx.strokeText(node.entry.name, x, y)
  ctx.fillStyle = view.colors.foreground
  ctx.fillText(node.entry.name, x, y)
}

// An entry as a plain dot in the colour of its kind. The hovered entry and the ones
// next to it take the accent colour and the rest dim, blended over a moment. Names
// sit under the dots and fade in with the zoom; the picture shows inside the dot
// when zoomed in far. A hidden entry (to a GM) is faded and has a dashed ring.
export function drawNode(node: GraphNode, ctx: CanvasRenderingContext2D, scale: number, view: GraphView) {
  const { colors, settings } = view
  const x = node.x ?? 0
  const y = node.y ?? 0
  const r = radiusOf(node, settings.nodeSize)
  const { lit, dim } = view.hover.node(node.id, view.near)
  const hidden = view.marksHidden && !node.entry.revealed
  const tint = WORLD_KINDS[node.entry.kind].tint

  ctx.save()
  ctx.globalAlpha = (1 - dim * (1 - lit) * DIM_NODES) * (hidden ? 0.6 : 1)

  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = lit > 0 ? mixIn(colors.primary, lit, tint) : tint
  ctx.fill()

  const pictureAlpha = clamp((scale - IMAGE_FROM) / (IMAGE_FULL - IMAGE_FROM))
  if (pictureAlpha > 0) drawPicture(ctx, node, r, pictureAlpha, view)

  if (hidden) {
    ctx.beginPath()
    ctx.arc(x, y, r + 2 / Math.max(scale, 1), 0, 2 * Math.PI)
    ctx.lineWidth = 1 / scale
    ctx.setLineDash([2 / scale, 1.5 / scale])
    ctx.strokeStyle = tint
    ctx.stroke()
  }

  ctx.globalAlpha *= Math.max(lit, clamp((scale - settings.labelThreshold) / LABEL_FADE))
  if (ctx.globalAlpha > 0.02) drawLabel(ctx, node, r, scale, view)
  ctx.restore()
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

  const { lit, dim } = view.hover.link(from.id, to.id)
  const base = `color-mix(in oklab, ${view.colors.mutedForeground} 45%, transparent)`

  ctx.save()
  ctx.globalAlpha = 1 - dim * (1 - lit) * DIM_LINES
  ctx.beginPath()
  ctx.moveTo(from.x, from.y ?? 0)
  ctx.lineTo(to.x, to.y ?? 0)
  ctx.lineWidth = ((0.8 + lit * 0.8) * view.settings.lineThickness) / scale
  ctx.setLineDash(link.mention ? [] : [4 / scale, 3 / scale])
  ctx.strokeStyle = lit > 0 ? mixIn(view.colors.primary, lit, base) : base
  ctx.stroke()
  ctx.restore()
}
