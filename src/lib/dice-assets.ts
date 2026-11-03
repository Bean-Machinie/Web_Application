import type DiceBox from "@3d-dice/dice-box-threejs"
import geistUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url"

// The library finds the files of a texture at this path plus the texture's own source.
export const DICE_ASSET_PATH = `${import.meta.env.BASE_URL}dice-textures/`

// The library hands out the entries of its texture table themselves, and a colorset writes its material
// onto the one it gets. Styles that share an entry (every one with no texture) would then overwrite each
// other's material, so each lookup gets a copy. Call on a box before it is initialized, since the first
// theme is loaded then.
export function isolateDiceTextures(box: DiceBox) {
  const colors = box.DiceColors
  const builtIn = colors.getTexture.bind(colors)
  colors.getTexture = (name) => {
    const found = builtIn(name)
    return Array.isArray(found) ? found : { ...(found as object) }
  }
}

// The library sets a die's numerals as "<size>pt <font>", which has no place for a weight, so the app's
// variable font is declared under a name of its own at a bold weight.
const FONT = "DiceNumerals"
const DICE_TYPES = ["d4", "d6", "d8", "d10", "d100", "d12", "d20"]
let fontReady: Promise<void> | undefined

export function loadDiceFont(box: DiceBox) {
  // The die definitions are shared by every box, so this reaches them all.
  for (const type of DICE_TYPES) box.DiceFactory.get(type).font = FONT
  fontReady ??= new FontFace(FONT, `url(${geistUrl})`, { weight: "800" })
    .load()
    .then((face) => {
      document.fonts.add(face)
    })
    // Without it the numerals fall back to the browser's default font.
    .catch((error) => console.error("The dice font could not load", error))
  return fontReady
}
