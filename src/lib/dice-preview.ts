import type DiceBox from "@3d-dice/dice-box-threejs"
import type { DiceMesh } from "@3d-dice/dice-box-threejs"
import { CHARCOAL, loadDiceLib } from "@/lib/dice-box"
import type { Sides } from "@/lib/dice"

export const PREVIEW_ID = "dice-preview"

// The die or dice a tile shows, by the library's own names. A d100 is the percentile die and a d10.
const PARTS: Record<Sides, string[]> = {
  4: ["d4"], 6: ["d6"], 8: ["d8"], 10: ["d10"], 12: ["d12"], 20: ["d20"], 100: ["d100", "d10"],
}

const PADDING = 6
const HOVER_SCALE = 1.15
const SPIN_SPEED = 0.9
const THROW_SPEED = 14
const THROW_MS = 450
// Long enough for the panel to finish opening and a tile to settle after the pointer leaves.
const SETTLE_MS = 600

type Tile = { element: HTMLElement; meshes: DiceMesh[]; scale: number; spin: number; throwUntil: number }
export type DicePreview = { hover(sides: Sides | null): void; throwDie(sides: Sides): void; close(): void }

let box: Promise<DiceBox> | undefined
const meshes = new Map<string, DiceMesh>()

// One box for the page, made when the panel first opens: the same charcoal dice as the thrown ones.
function getBox(host: HTMLElement) {
  box ??= loadDiceLib().then(async (Library) => {
    const created = new Library(`#${PREVIEW_ID}`, { theme_customColorset: CHARCOAL, theme_material: "none", shadows: false, sounds: false })
    await created.initialize()
    created.renderer.autoClear = false
    created.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    return created
  })
  box.catch(() => (box = undefined))
  return box.then((created) => {
    // The panel is new each time it opens; the canvas moves into it.
    created.container = host
    host.appendChild(created.renderer.domElement)
    return created
  })
}

function meshOf(created: DiceBox, type: string) {
  let mesh = meshes.get(type)
  if (!mesh) {
    mesh = created.DiceFactory.create(type, created.colorData) ?? undefined
    if (!mesh) throw new Error(`No ${type} die`)
    mesh.geometry.computeBoundingSphere()
    created.scene.add(mesh)
    meshes.set(type, mesh)
  }
  return mesh
}

// Draws the dice into the tiles' areas on one canvas laid over the row, and only while something moves.
export async function openDicePreview(
  host: HTMLElement,
  elements: () => Partial<Record<Sides, HTMLElement | null>>,
  reducedMotion: boolean
): Promise<DicePreview> {
  const created = await getBox(host)
  const tiles = new Map<Sides, Tile>()
  for (const [key, element] of Object.entries(elements())) {
    if (!element) continue
    const sides = Number(key) as Sides
    tiles.set(sides, { element, meshes: PARTS[sides].map((type) => meshOf(created, type)), scale: 1, spin: 0, throwUntil: 0 })
  }

  let hovered: Sides | null = null
  let frame = 0
  let settleUntil = 0
  let last = 0
  let size = ""

  function draw() {
    const { renderer, camera } = created
    const bounds = host.getBoundingClientRect()
    if (bounds.width === 0) return
    const next = `${bounds.width}x${bounds.height}`
    if (next !== size) {
      renderer.setSize(bounds.width, bounds.height)
      size = next
    }
    created.desk.visible = false
    camera.far = 5000
    renderer.setScissorTest(false)
    renderer.clear()
    renderer.setScissorTest(true)

    for (const [, tile] of tiles) {
      const rect = tile.element.getBoundingClientRect()
      const width = (rect.width + PADDING * 2) / tile.meshes.length
      const height = rect.height + PADDING * 2
      tile.meshes.forEach((mesh, index) => {
        const x = rect.left - bounds.left - PADDING + index * width
        const y = bounds.bottom - rect.bottom - PADDING
        renderer.setViewport(x, y, width, height)
        renderer.setScissor(x, y, width, height)
        camera.aspect = width / height
        const radius = mesh.geometry.boundingSphere?.radius ?? 100
        camera.position.set(0, 0, radius / (Math.tan((camera.fov * Math.PI) / 360) * Math.min(1, camera.aspect) * 0.78))
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
        for (const other of meshes.values()) other.visible = false
        mesh.visible = true
        mesh.scale.setScalar(tile.scale)
        mesh.rotation.order = "YXZ"
        mesh.rotation.set(-0.5, 0.55 + tile.spin, 0.12)
        renderer.render(created.scene, camera)
      })
    }
  }

  function tick(now: number) {
    const delta = Math.min((now - last) / 1000, 0.05)
    last = now
    let moving = now < settleUntil
    for (const [sides, tile] of tiles) {
      const throwing = now < tile.throwUntil
      const target = throwing ? 0.8 : sides === hovered && !reducedMotion ? HOVER_SCALE : 1
      tile.scale += (target - tile.scale) * Math.min(1, delta * 14)
      if (throwing) tile.spin += delta * THROW_SPEED
      else if (sides === hovered && !reducedMotion) tile.spin += delta * SPIN_SPEED
      if (throwing || sides === hovered || Math.abs(tile.scale - target) > 0.003) moving = true
    }
    draw()
    frame = moving ? requestAnimationFrame(tick) : 0
  }

  function wake() {
    settleUntil = performance.now() + SETTLE_MS
    if (!frame) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }

  wake()
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
      frame = 0
      created.renderer.domElement.remove()
    },
  }
}
