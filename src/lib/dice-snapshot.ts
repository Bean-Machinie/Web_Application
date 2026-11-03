import { createCamera, drawDice, meshesOf, sharedRenderer, styledEngine } from "@/lib/dice-engine"
import type { Sides } from "@/lib/dice"
import type { DiceStyle } from "@/lib/dice-styles"

const SIZE = 96
const cache = new Map<string, Promise<string>>()

// A still picture of a die in a style, drawn once with the same 3D dice as the tray and kept.
export function dieSnapshot(sides: Sides, style: DiceStyle) {
  const key = `${style.id}/${sides}`
  let url = cache.get(key)
  if (!url) {
    url = render(sides, style)
    url.catch(() => cache.delete(key))
    cache.set(key, url)
  }
  return url
}

async function render(sides: Sides, style: DiceStyle) {
  const created = await styledEngine(style)
  const renderer = sharedRenderer(created, "snapshot", 1)
  renderer.setSize(SIZE, SIZE)
  renderer.clear()
  drawDice(created, renderer, createCamera(created), meshesOf(created, sides, style), { x: 0, y: 0, width: SIZE, height: SIZE, pad: 0 }, { scale: 1, spin: 0 })
  // Read straight after drawing, before the browser clears the canvas.
  const url = renderer.domElement.toDataURL("image/png")
  return url
}
