import { bakeRect, bakeSteps, makeScratch } from "./map-asset-bake"
import type { Colours, Picture } from "./map-asset-bake"
import type { Piece, Rect } from "./map-asset-pieces"
import type { Ground } from "./map-ground"
import { timeSlicer } from "./time-slice"

// Everything needed to draw the pieces: those that can be drawn (back to front),
// a way to find the ones near a rectangle, and what lies under them.
export type Drawing = {
  pieces: Piece[]
  near: (rect: Rect) => Piece[]
  ground: Ground
  colours: Colours
}

// Pictures are drawn a slice at a time, this many of their own pixels across.
const SLICE = 1024
// The overview of the whole canvas is never made larger than this many pixels.
const OVERVIEW_PIXELS = 4_000_000
// The overview catches up once editing has paused this long, but never waits
// longer than the maximum, however steadily the edits come.
const LATE_MS = 600
const LATE_MAX_MS = 2500

export const blankPicture = (rect: Rect, scale: number): Picture => {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(rect.width * scale))
  canvas.height = Math.max(1, Math.round(rect.height * scale))
  return { canvas, x: rect.x, y: rect.y, scale }
}

// Draws a whole picture, slice by slice and piece by piece, giving the thread
// back to the browser whenever it has had it for a while, so that making a
// picture never holds the page up. "drawing" is asked for again at each slice: if
// it changed while a slice was paused, the slice is drawn again from the new one.
// Stops, saying so, if "stale" says the picture is no longer wanted.
export async function bakeAll(picture: Picture, drawing: () => Drawing, stale: () => boolean = () => false) {
  const step = SLICE / picture.scale
  const width = picture.canvas.width / picture.scale
  const height = picture.canvas.height / picture.scale
  const tick = timeSlicer()
  const scratch = makeScratch()
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const rect = { x: picture.x + x, y: picture.y + y, width: step, height: step }
      for (let again = true; again; ) {
        if (stale()) return false
        const now = drawing()
        const steps = bakeSteps(picture, rect, now.near(rect), now.ground, now.colours, scratch)
        again = false
        while (!steps.next().done) {
          if (!(await tick())) continue
          if (stale()) {
            steps.return(undefined)
            return false
          }
          if (drawing() !== now) {
            steps.return(undefined)
            again = true
            break
          }
        }
      }
      await tick()
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
  let lateSince = 0
  let busy = false
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
      return drawing ? bakeAll(overview, () => drawing!, () => run !== overviewRun) : false
    },
    // Makes the sharp picture of a region, and swaps it in when it is done.
    async bakeView(region: Rect, viewScale: number) {
      const run = ++viewRun
      const next = blankPicture(region, viewScale)
      building = next
      const done = drawing ? await bakeAll(next, () => drawing!, () => run !== viewRun) : false
      if (building === next) building = null
      if (done) view = next
      return done
    },
    // Stops making the sharp picture, so that something more urgent has the
    // thread. Nothing is made again until asked.
    cancelView() {
      viewRun++
      building = null
    },
    // While something is being moved the overview does not catch up, whatever its wait.
    hold(held: boolean) {
      busy = held
    },
    // Draws again only the places near these rectangles. The sharp picture is
    // what is on screen, so it is done at once; the overview, which shows only
    // where the sharp picture does not, is done once editing has paused, all together.
    patch(rects: Rect[]) {
      if (!drawing) return
      const sharp = [view, building].filter((picture) => picture !== null)
      for (const picture of view ? sharp : [overview, ...sharp]) {
        for (const rect of rects) bakeRect(picture, rect, drawing.near(rect), drawing.ground, drawing.colours)
      }
      if (!view) return
      late.push(...rects)
      const now = performance.now()
      if (late.length === rects.length) lateSince = now
      clearTimeout(lateTimer)
      lateTimer = setTimeout(
        function flush() {
          if (busy) {
            lateTimer = setTimeout(flush, LATE_MS)
            return
          }
          lateTimer = undefined
          const waiting = late.splice(0)
          if (drawing) for (const rect of waiting) bakeRect(overview, rect, drawing.near(rect), drawing.ground, drawing.colours)
          onLate?.()
        },
        Math.min(LATE_MS, Math.max(lateSince + LATE_MAX_MS - now, 0))
      )
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
