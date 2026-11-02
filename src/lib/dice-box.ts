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

let box: Promise<DiceBoxType> | undefined

// The 3D engine is heavy, so it is only fetched on the first roll.
export function getDiceBox() {
  box ??= loadDiceLib().then(async (DiceBox) => {
    const created = new DiceBox(`#${DICE_LAYER_ID}`, {
      theme_customColorset: CHARCOAL,
      theme_material: "none",
      shadows: true,
      sounds: false,
    })
    await created.initialize()
    return created
  })
  box.catch(() => (box = undefined))
  return box
}
