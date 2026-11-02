import { createCamera, drawDice, getEngine, meshesOf, sharedRenderer } from "@/lib/dice-engine"
import type { Sides } from "@/lib/dice"

const SIZE = 96
const cache = new Map<Sides, Promise<string>>()

// A still picture of a die, drawn once with the same 3D dice as the tray and kept.
export function dieSnapshot(sides: Sides) {
  let url = cache.get(sides)
  if (!url) {
    url = render(sides)
    url.catch(() => cache.delete(sides))
    cache.set(sides, url)
  }
  return url
}

async function render(sides: Sides) {
  const created = await getEngine()
  const renderer = sharedRenderer(created, "snapshot", 1)
  renderer.setSize(SIZE, SIZE)
  renderer.clear()
  drawDice(created, renderer, createCamera(created), meshesOf(created, sides), { x: 0, y: 0, width: SIZE, height: SIZE, pad: 0 }, { scale: 1, spin: 0 })
  // Read straight after drawing, before the browser clears the canvas.
  const url = renderer.domElement.toDataURL("image/png")
  return url
}
