import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

// A picture ready to draw: round, and kept at several sizes. Drawing a big picture
// down to a few pixels every frame is slow and shimmers; a size that is close to the
// one on screen is neither.
const TOP = 128
const SMALLER = [64, 32]

export type Sprite = HTMLCanvasElement[]

const covers = new Map<string, Sprite | null>()
const icons = new Map<WorldEntryKind, Sprite | null>()

function blank(size: number) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  return canvas
}

// The square at (x, y), side wide, shrunk to size by halves, which stays sharper
// than one big step.
function shrink(source: CanvasImageSource, x: number, y: number, side: number, size: number) {
  let from = source
  let at = { x, y }
  let width = side
  let canvas: HTMLCanvasElement
  do {
    canvas = blank(Math.max(size, Math.floor(width / 2)))
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.imageSmoothingQuality = "high"
    ctx?.drawImage(from, at.x, at.y, width, width, 0, 0, canvas.width, canvas.height)
    from = canvas
    at = { x: 0, y: 0 }
    width = canvas.width
  } while (width > size)
  return canvas
}

function withSmaller(top: HTMLCanvasElement): Sprite {
  return [top, ...SMALLER.map((size) => shrink(top, 0, 0, TOP, size))]
}

function round(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.globalCompositeOperation = "destination-in"
  ctx.beginPath()
  ctx.arc(TOP / 2, TOP / 2, TOP / 2, 0, 2 * Math.PI)
  ctx.fill()
}

function fromCover(image: HTMLImageElement): Sprite {
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  const top = shrink(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, TOP)
  round(top)
  return withSmaller(top)
}

function fromIcon(image: HTMLImageElement): Sprite {
  const top = blank(TOP)
  top.getContext("2d")?.drawImage(image, 0, 0, TOP, TOP)
  return withSmaller(top)
}

function load(src: string, done: (image: HTMLImageElement) => void) {
  const image = new Image()
  image.onload = () => image.naturalWidth > 0 && done(image)
  image.src = src
}

// The cover of an entry as a sprite, or null until it has loaded (and for good if it
// cannot). Each is loaded once, and the graph is redrawn when it has.
export function coverOf(url: string, refresh: () => void): Sprite | null {
  if (covers.has(url)) return covers.get(url) ?? null
  covers.set(url, null)
  load(url, (image) => {
    covers.set(url, fromCover(image))
    refresh()
  })
  return null
}

// The icon of a kind, in white, for the dot of an entry with no cover.
export function iconOf(kind: WorldEntryKind, refresh: () => void): Sprite | null {
  if (icons.has(kind)) return icons.get(kind) ?? null
  icons.set(kind, null)
  const svg = renderToStaticMarkup(
    createElement(WORLD_KINDS[kind].icon, { size: TOP, color: "white", strokeWidth: 2 })
  )
  load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, (image) => {
    icons.set(kind, fromIcon(image))
    refresh()
  })
  return null
}

// The smallest size that still has at least `pixels` across.
export function spriteAt(sprite: Sprite, pixels: number) {
  let best = sprite[0]
  for (const size of sprite) if (size.width >= pixels) best = size
  return best
}
