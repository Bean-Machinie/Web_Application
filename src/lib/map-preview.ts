import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"

// Pictures of maps that have a saved scene but are not published, drawn in the browser for
// showing and never uploaded. Drawing needs the builder's own stage, which one hidden host
// provides (see MapPreviewHost), so jobs wait their turn and are made one at a time.

// The picture's address and its size in pixels.
export type Preview = { url: string; width: number; height: number }

export type PreviewJob = {
  key: string
  scene: MapScene
  // The longer side of the picture, in pixels.
  maxSide: number
  resolve: (preview: Preview) => void
  reject: (error: unknown) => void
}

// By map, when it was last saved and how large, so a map that has not changed is not drawn again.
// The pictures stay for as long as the page does.
const cache = new Map<string, Promise<Preview>>()
const queue: PreviewJob[] = []
const listeners = new Set<() => void>()
let current: PreviewJob | null = null

export const previewKey = (mapId: string, updatedAt: string, maxSide: number) => `${mapId}:${updatedAt}:${maxSide}`

export const cachedPreview = (key: string) => cache.get(key)

// How many times larger than the canvas to draw it, to have `maxSide` on the longer side.
export const previewScale = ({ width, height }: MapScene["canvas"], maxSide: number) =>
  Math.min(renderScale({ width, height }), maxSide / Math.max(width, height))

function notify() {
  listeners.forEach((listener) => listener())
}

// Drawing a picture holds the page for a moment, so each one waits for the browser to be idle and
// for a short pause after the one before, keeping scrolling and navigating smooth.
const PAUSE_MS = 300
let waiting = false

function next() {
  if (current || waiting || queue.length === 0) return
  waiting = true
  const start = () => {
    waiting = false
    current = queue.shift() ?? null
    if (current) notify()
  }
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(start, { timeout: 2000 })
  else window.setTimeout(start, 100)
}

export function requestPreview(key: string, scene: MapScene, maxSide: number) {
  const known = cache.get(key)
  if (known) return known

  const made = new Promise<Preview>((resolve, reject) => {
    queue.push({ key, scene, maxSide, resolve, reject })
    next()
  })
  cache.set(key, made)
  // A failed one is tried again next time it is asked for.
  made.catch(() => cache.delete(key))
  return made
}

export function finishPreview(job: PreviewJob, outcome: { preview: Preview } | { error: unknown }) {
  if (current !== job) return
  if ("preview" in outcome) job.resolve(outcome.preview)
  else job.reject(outcome.error)
  current = null
  notify()
  window.setTimeout(next, PAUSE_MS)
}

export const currentPreview = () => current

export function subscribePreview(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
