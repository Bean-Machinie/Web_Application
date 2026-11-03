import type DiceBox from "@3d-dice/dice-box-threejs"
import type { DiceCamera, DiceMesh } from "@3d-dice/dice-box-threejs"
import { createCamera, drawDice, meshesOf, sharedRenderer, styledEngine } from "@/lib/dice-engine"
import { getDiceStyle, subscribeDiceStyle } from "@/lib/dice-style-store"
import type { Sides } from "@/lib/dice"

const PADDING = 8
const HOVER_SCALE = 1.15
const SPIN_SPEED = 0.9
const THROW_SPEED = 14
const THROW_MS = 450
// Long enough for a tile to settle after the pointer leaves.
const SETTLE_MS = 600

type Tile = { element: HTMLElement; dice: DiceMesh[]; camera: DiceCamera; scale: number; spin: number; throwUntil: number }
// The canvas is one for the whole page, so only the newest preview may take it away again: an older one
// that closes late (a panel closed and reopened, or React starting an effect twice) must leave it alone.
let owner: object | null = null

export type DicePreview = { hover(sides: Sides | null): void; throwDie(sides: Sides): void; close(): void }

// The dice of the tray, drawn into their tiles' areas on one canvas laid over the row, by a renderer of
// its own. It draws only while something moves, and again when the panel's size or position changes.
export async function openDicePreview(
  host: HTMLElement,
  elements: () => Partial<Record<Sides, HTMLElement | null>>,
  reducedMotion: boolean
): Promise<DicePreview> {
  const created: DiceBox = await styledEngine(getDiceStyle())
  const renderer = sharedRenderer(created, "panel", Math.min(window.devicePixelRatio, 2))
  const token = {}
  owner = token
  host.appendChild(renderer.domElement)
  renderer.domElement.style.display = "block"

  const tiles = new Map<Sides, Tile>()
  for (const [key, element] of Object.entries(elements())) {
    if (!element) continue
    const sides = Number(key) as Sides
    tiles.set(sides, { element, dice: meshesOf(created, sides, getDiceStyle()), camera: createCamera(created), scale: 1, spin: 0, throwUntil: 0 })
  }

  let hovered: Sides | null = null
  let frame = 0
  let settleUntil = 0
  let last = 0
  let size = ""

  function draw() {
    const bounds = host.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return
    const next = `${bounds.width}x${bounds.height}`
    if (next !== size) {
      renderer.setSize(bounds.width, bounds.height)
      size = next
    }
    renderer.setScissorTest(false)
    renderer.clear()
    for (const tile of tiles.values()) {
      const rect = tile.element.getBoundingClientRect()
      const area = {
        x: rect.left - bounds.left - PADDING,
        y: bounds.bottom - rect.bottom - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
        pad: PADDING,
      }
      drawDice(created, renderer, tile.camera, tile.dice, area, tile)
    }
  }

  function tick(now: number) {
    frame = 0
    try {
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      let moving = now < settleUntil
      for (const [sides, tile] of tiles) {
        const throwing = now < tile.throwUntil
        const turning = sides === hovered && !reducedMotion
        const target = throwing ? 0.8 : turning ? HOVER_SCALE : 1
        tile.scale += (target - tile.scale) * Math.min(1, delta * 14)
        if (throwing) tile.spin += delta * THROW_SPEED
        else if (turning) tile.spin += delta * SPIN_SPEED
        if (throwing || turning || Math.abs(tile.scale - target) > 0.003) moving = true
      }
      draw()
      if (moving) frame = requestAnimationFrame(tick)
    } catch (error) {
      console.error("The dice preview could not draw", error)
    }
  }

  function wake() {
    settleUntil = performance.now() + SETTLE_MS
    if (!frame) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }

  // The panel opens with an animation, so its first measurements are off: measure again when it ends and whenever the canvas is resized.
  const popover = host.closest("[data-slot='popover-content']")
  popover?.addEventListener("animationend", wake)
  const observer = new ResizeObserver(wake)
  observer.observe(host)
  wake()

  // The dice are made again in the new style, in the same tiles.
  const unsubscribe = subscribeDiceStyle(() => {
    const style = getDiceStyle()
    styledEngine(style)
      .then((engine) => {
        if (style.id !== getDiceStyle().id) return
        for (const [sides, tile] of tiles) tile.dice = meshesOf(engine, sides, style)
        wake()
      })
      .catch((error) => console.error("The dice preview could not change style", error))
  })

  return {
    hover(sides) {
      hovered = sides
      wake()
    },
    throwDie(sides) {
      const tile = tiles.get(sides)
      if (tile && !reducedMotion) tile.throwUntil = performance.now() + THROW_MS
      wake()
    },
    close() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      unsubscribe()
      popover?.removeEventListener("animationend", wake)
      if (owner === token) {
        renderer.domElement.remove()
        owner = null
      }
    },
  }
}
