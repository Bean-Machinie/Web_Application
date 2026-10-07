import { bakeRect } from "./map-asset-bake"
import type { Colours, Picture } from "./map-asset-bake"
import type { Piece, Rect } from "./map-asset-pieces"
import type { Ground } from "./map-ground"

// Everything needed to draw the pieces: those that can be drawn (back to front),
// a way to find the ones near a rectangle, and what lies under them.
export type Drawing = {
  pieces: Piece[]
  near: (rect: Rect) => Piece[]
  ground: Ground
  colours: Colours
}

// Pictures are drawn a slice at a time, this many of their own pixels across, so
// that making one never holds the page up for long.
const SLICE = 1024
// The overview of the whole canvas is never made larger than this many pixels.
const OVERVIEW_PIXELS = 4_000_000
// How long the overview waits to catch up with a change.
const LATE_MS = 150

export const blankPicture = (rect: Rect, scale: number): Picture => {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(rect.width * scale))
  canvas.height = Math.max(1, Math.round(rect.height * scale))
  return { canvas, x: rect.x, y: rect.y, scale }
}

const pause = () => new Promise((resolve) => setTimeout(resolve, 0))

// Draws a whole picture, slice by slice. Stops, saying so, if "stale" says the
// picture is no longer wanted.
export async function bakeAll(picture: Picture, drawing: Drawing, stale: () => boolean = () => false) {
  const step = SLICE / picture.scale
  const width = picture.canvas.width / picture.scale
  const height = picture.canvas.height / picture.scale
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (stale()) return false
      const rect = { x: picture.x + x, y: picture.y + y, width: step, height: step }
      bakeRect(picture, rect, drawing.near(rect), drawing.ground, drawing.colours)
      await pause()
    }
  }
  return true
}

// The two pictures of the pieces the builder shows. The overview covers the
// whole canvas at modest size and is always there, so panning off the sharp
// picture, or zooming out of it, never shows an empty edge. The view is sharp,
// for the part of the canvas in sight at the zoom it settled at; a new one is
// made out of sight, and replaces the old one only when it is done.
export function createPictures(canvas: { width: number; height: number }) {
  const scale = Math.min(1, Math.sqrt(OVERVIEW_PIXELS / (canvas.width * canvas.height)))
  const overview = blankPicture({ x: 0, y: 0, ...canvas }, scale)
  let view: Picture | null = null
  let building: Picture | null = null
  let drawing: Drawing | null = null
  let overviewRun = 0
  const late: Rect[] = []
  let lateTimer: ReturnType<typeof setTimeout> | undefined
  let onLate: (() => void) | undefined
  let viewRun = 0

  return {
    overview,
    get view() {
      return view
    },
    // What to draw from now on. Nothing is redrawn until asked.
    use(next: Drawing) {
      drawing = next
    },
    async bakeOverview() {
      const run = ++overviewRun
      return drawing ? bakeAll(overview, drawing, () => run !== overviewRun) : false
    },
    // Makes the sharp picture of a region, and swaps it in when it is done.
    async bakeView(region: Rect, viewScale: number) {
      const run = ++viewRun
      const next = blankPicture(region, viewScale)
      building = next
      const done = drawing ? await bakeAll(next, drawing, () => run !== viewRun) : false
      if (building === next) building = null
      if (done) view = next
      return done
    },
    // Draws again only the places near these rectangles. The sharp picture is
    // what is on screen, so it is done at once; the overview, which shows only
    // where the sharp picture does not, is done a moment later, all together.
    patch(rects: Rect[]) {
      if (!drawing) return
      const sharp = [view, building].filter((picture) => picture !== null)
      for (const picture of view ? sharp : [overview, ...sharp]) {
        for (const rect of rects) bakeRect(picture, rect, drawing.near(rect), drawing.ground, drawing.colours)
      }
      if (!view) return
      late.push(...rects)
      if (lateTimer === undefined) {
        lateTimer = setTimeout(() => {
          lateTimer = undefined
          const rects = late.splice(0)
          if (drawing) for (const rect of rects) bakeRect(overview, rect, drawing.near(rect), drawing.ground, drawing.colours)
          onLate?.()
        }, LATE_MS)
      }
    },
    // Called after the overview has caught up.
    onLate(listener: () => void) {
      onLate = listener
      return () => {
        onLate = undefined
      }
    },
  }
}

export type Pictures = ReturnType<typeof createPictures>
