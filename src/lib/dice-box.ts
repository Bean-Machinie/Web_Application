import type DiceBoxType from "@3d-dice/dice-box-threejs"

export const DICE_LAYER_ID = "dice-layer"

// Matte charcoal with white numerals: no texture, a faint lighter edge.
export const CHARCOAL = {
  name: "charcoal",
  foreground: "#ffffff",
  background: "#2b2b2f",
  outline: "none",
  edge: "#55555c",
  texture: "none",
  material: "none",
}

// The library is fetched once, whoever asks first: the panel when it opens, or a roll.
export const loadDiceLib = () => import("@3d-dice/dice-box-threejs").then((module) => module.default)

// Each roll plays out on a box of its own, so a roll never cuts another one short. A few boxes are
// made as they are needed; a roll beyond them waits for one to be free.
export const DICE_SLOTS = 5
export const layerId = (slot: number) => `${DICE_LAYER_ID}-${slot}`

const boxes: (Promise<DiceBoxType> | undefined)[] = []
const busy = new Set<number>()
const waiting: (() => void)[] = []

// The 3D engine is heavy, so a box is only made when a roll first needs it.
function boxFor(slot: number) {
  const made = (boxes[slot] ??= loadDiceLib().then(async (DiceBox) => {
    const created = new DiceBox(`#${layerId(slot)}`, {
      theme_customColorset: CHARCOAL,
      theme_material: "none",
      shadows: true,
      sounds: false,
    })
    await created.initialize()
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
    return { slot: taken, box: await boxFor(taken), release }
  } catch (error) {
    release()
    throw error
  }
}
