import type DiceBox from "@3d-dice/dice-box-threejs"
import type { DiceCamera, DiceMesh, DiceRenderer } from "@3d-dice/dice-box-threejs"
import { CHARCOAL, loadDiceLib } from "@/lib/dice-box"
import type { Sides } from "@/lib/dice"

// The die or dice a tile shows, by the library's own names. A d100 is the percentile die and a d10.
export const PARTS: Record<Sides, string[]> = {
  4: ["d4"], 6: ["d6"], 8: ["d8"], 10: ["d10"], 12: ["d12"], 20: ["d20"], 100: ["d100", "d10"],
}

// How much of its area a die fills.
const FILL = 0.85

const meshes = new Map<string, DiceMesh>()
let engine: Promise<DiceBox> | undefined

// The library, started once and kept out of sight. Only its dice and lights are used: the panel and
// the snapshots draw with renderers of their own, so nothing here touches the roll overlay.
export function getEngine() {
  engine ??= loadDiceLib().then(async (Library) => {
    const hidden = document.createElement("div")
    hidden.id = "dice-engine"
    hidden.style.cssText = "position:fixed;width:256px;height:256px;visibility:hidden;pointer-events:none"
    document.body.appendChild(hidden)
    const created = new Library("#dice-engine", { theme_customColorset: CHARCOAL, theme_material: "none", shadows: false, sounds: false })
    await created.initialize()
    created.desk.visible = false
    // A key light from the upper left and a soft ambient one, set here so they do not depend on the engine size.
    created.light.position.set(-250, 300, 700)
    created.light.distance = 4000
    created.light.intensity = 1.1
    created.light_amb.intensity = 0.9
    return created
  })
  engine.catch(() => (engine = undefined))
  return engine
}

function meshOf(created: DiceBox, type: string) {
  let mesh = meshes.get(type)
  if (!mesh) {
    mesh = created.DiceFactory.create(type, created.colorData) ?? undefined
    if (!mesh) throw new Error(`The library has no ${type} die`)
    mesh.geometry.computeBoundingSphere()
    created.scene.add(mesh)
    meshes.set(type, mesh)
  }
  return mesh
}

export const meshesOf = (created: DiceBox, sides: Sides) => PARTS[sides].map((type) => meshOf(created, type))

// Made from the library's own classes, so they match the dice they draw.
export function createRenderer(created: DiceBox, ratio: number) {
  const Renderer = created.renderer.constructor as new (options: object) => DiceRenderer
  const renderer = new Renderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(ratio)
  renderer.setClearColor(0, 0)
  renderer.autoClear = false
  return renderer
}

// A browser allows only so many WebGL contexts, and the page's background needs one, so the panel and the
// snapshots each keep a single renderer for good instead of making one per use.
const shared = new Map<string, DiceRenderer>()
export function sharedRenderer(created: DiceBox, key: "panel" | "snapshot", ratio: number) {
  let renderer = shared.get(key)
  if (!renderer) {
    renderer = createRenderer(created, ratio)
    shared.set(key, renderer)
  }
  return renderer
}

export function createCamera(created: DiceBox) {
  const Camera = created.camera.constructor as new (fov: number, aspect: number, near: number, far: number) => DiceCamera
  return new Camera(20, 1, 1, 5000)
}

// An area of the canvas in CSS pixels, measured from its bottom left, with room around the die for it to grow.
export type Frame = { x: number; y: number; width: number; height: number; pad: number }
export type Pose = { scale: number; spin: number }

export function drawDice(created: DiceBox, renderer: DiceRenderer, camera: DiceCamera, dice: DiceMesh[], frame: Frame, pose: Pose) {
  // Two dice (the percentile die and the d10) overlap a little and together fill the frame.
  const width = dice.length === 1 ? frame.width : frame.width * 0.62
  renderer.setScissorTest(true)
  dice.forEach((mesh, index) => {
    const x = frame.x + index * (frame.width - width)
    renderer.setViewport(x, frame.y, width, frame.height)
    renderer.setScissor(x, frame.y, width, frame.height)
    camera.aspect = width / frame.height
    // The die's own area is the frame without its padding; the world size of a pixel follows from its bounding sphere.
    const radius = mesh.geometry.boundingSphere?.radius ?? 100
    const unit = (2 * radius) / (FILL * Math.max(1, Math.min(width, frame.height) - frame.pad * 2))
    camera.position.set(0, 0, (unit * frame.height) / 2 / Math.tan((camera.fov * Math.PI) / 360))
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    for (const other of meshes.values()) other.visible = false
    mesh.visible = true
    mesh.scale.setScalar(pose.scale)
    mesh.rotation.order = "YXZ"
    mesh.rotation.set(-0.5, 0.55 + pose.spin, 0.12)
    renderer.render(created.scene, camera)
  })
}
