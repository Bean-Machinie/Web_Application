import type { DiceCamera, DiceMesh } from "@3d-dice/dice-box-threejs"
import { createCamera, createRenderer, drawDice, meshesOf, styledEngine } from "@/lib/dice-engine"
import type { DiceStyle } from "@/lib/dice-styles"

const PADDING = 6
const HOVER_SCALE = 1.08
const SPIN_SPEED = 0.5
// Long enough for a card to settle after the pointer leaves it.
const SETTLE_MS = 600

type Entry = { element: HTMLElement; dice: DiceMesh[]; camera: DiceCamera; scale: number; spin: number }

export type StylePreview = { hover(id: string | null): void; close(): void }

// A d20 in every style, drawn into the cards' areas on one canvas laid over the grid, by a renderer made for
// this and thrown away on close. It draws once when it opens, and again only while a die moves or the grid's
// size or position changes; only the hovered die turns.
export async function openStylePreview(
  host: HTMLElement,
  elements: () => Record<string, HTMLElement | null>,
  styles: DiceStyle[],
  reducedMotion: boolean
): Promise<StylePreview> {
  // The dice of a style are made after its colorset and numerals are ready.
  let created = await styledEngine(styles[0])
  for (const style of styles) created = await styledEngine(style)
  const renderer = createRenderer(created, Math.min(window.devicePixelRatio, 2))
  host.appendChild(renderer.domElement)
  renderer.domElement.style.display = "block"

  const entries = new Map<string, Entry>()
  for (const style of styles) {
    const element = elements()[style.id]
    if (element) entries.set(style.id, { element, dice: meshesOf(created, 20, style), camera: createCamera(created), scale: 1, spin: 0 })
  }

  let hovered: string | null = null
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
    for (const entry of entries.values()) {
      const rect = entry.element.getBoundingClientRect()
      const area = {
        x: rect.left - bounds.left - PADDING,
        y: bounds.bottom - rect.bottom - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
        pad: PADDING,
      }
      drawDice(created, renderer, entry.camera, entry.dice, area, entry)
    }
  }

  function tick(now: number) {
    frame = 0
    try {
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      let moving = now < settleUntil
      for (const [id, entry] of entries) {
        const turning = id === hovered && !reducedMotion
        const target = turning ? HOVER_SCALE : 1
        entry.scale += (target - entry.scale) * Math.min(1, delta * 12)
        if (turning) entry.spin += delta * SPIN_SPEED
        if (turning || Math.abs(entry.scale - target) > 0.003) moving = true
      }
      draw()
      if (moving) frame = requestAnimationFrame(tick)
    } catch (error) {
      console.error("The style preview could not draw", error)
    }
  }

  function wake() {
    settleUntil = performance.now() + SETTLE_MS
    if (!frame) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }

  // The dialog opens with an animation, so its first measurements are off: measure again when it ends.
  const dialog = host.closest("[data-slot='dialog-content']")
  dialog?.addEventListener("animationend", wake)
  const observer = new ResizeObserver(wake)
  observer.observe(host)
  wake()

  return {
    hover(id) {
      hovered = id
      wake()
    },
    close() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      dialog?.removeEventListener("animationend", wake)
      renderer.domElement.remove()
      renderer.dispose()
      // Browsers allow only so many WebGL contexts, so this one is given back at once.
      renderer.forceContextLoss()
    },
  }
}
