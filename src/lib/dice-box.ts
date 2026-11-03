import type DiceBoxType from "@3d-dice/dice-box-threejs"
import { DICE_ASSET_PATH, isolateDiceTextures, loadDiceFont } from "@/lib/dice-assets"
import { applyLabels, prepareLabels } from "@/lib/dice-label-faces"
import { applyRollLighting } from "@/lib/dice-lighting"
import { getDiceStyle, subscribeDiceStyle } from "@/lib/dice-style-store"
import { glossOf } from "@/lib/dice-styles"

export const DICE_LAYER_ID = "dice-layer"

// The library is fetched once, whoever asks first: the panel when it opens, or a roll.
export const loadDiceLib = () => import("@3d-dice/dice-box-threejs").then((module) => module.default)

// Each roll plays out on a box of its own, so a roll never cuts another one short. A few boxes are
// made as they are needed; a roll beyond them waits for one to be free.
export const DICE_SLOTS = 5
export const layerId = (slot: number) => `${DICE_LAYER_ID}-${slot}`

const boxes: (Promise<DiceBoxType> | undefined)[] = []
const styled = new WeakMap<DiceBoxType, string>()
const busy = new Set<number>()
const waiting: (() => void)[] = []

// updateConfig drops the colorset unless it is passed again, so it is always passed; the shininess is
// the factory's own and is set beside it.
async function styleBox(box: DiceBoxType) {
  const style = getDiceStyle()
  if (styled.get(box) === style.id) return
  styled.set(box, style.id)
  await box.updateConfig({ theme_customColorset: style, theme_material: "none" })
  Object.assign(box.DiceFactory.material_options, glossOf(style))
}

subscribeDiceStyle(() => boxes.forEach((made) => made?.then(styleBox).catch(() => {})))

// The 3D engine is heavy, so a box is only made when a roll first needs it.
function boxFor(slot: number) {
  const made = (boxes[slot] ??= loadDiceLib().then(async (DiceBox) => {
    const created = new DiceBox(`#${layerId(slot)}`, {
      assetPath: DICE_ASSET_PATH,
      theme_customColorset: getDiceStyle(),
      theme_material: "none",
      shadows: true,
      sounds: false,
    })
    isolateDiceTextures(created)
    await created.initialize()
    await loadDiceFont(created)
    await styleBox(created)
    return created
  }))
  made.catch(() => (boxes[slot] = undefined))
  return made
}

export type HeldBox = { slot: number; box: DiceBoxType; release: () => void }

export async function acquireDiceBox(): Promise<HeldBox> {
  const free = () => Array.from({ length: DICE_SLOTS }, (_, slot) => slot).find((slot) => !busy.has(slot))
  let slot = free()
  while (slot === undefined) {
    await new Promise<void>((resolve) => waiting.push(resolve))
    slot = free()
  }
  const taken = slot
  busy.add(taken)
  const release = () => {
    busy.delete(taken)
    waiting.shift()?.()
  }
  try {
    const box = await boxFor(taken)
    await styleBox(box)
    await prepareLabels(box, getDiceStyle())
    applyLabels(box, getDiceStyle())
    applyRollLighting(box)
    return { slot: taken, box, release }
  } catch (error) {
    release()
    throw error
  }
}
