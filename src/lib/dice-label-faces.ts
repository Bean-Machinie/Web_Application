import type DiceBox from "@3d-dice/dice-box-threejs"
import { faceFitAvailable, setFaceFit } from "@/lib/dice-face-fit"
import { faceLabel, typesOf } from "@/lib/dice-labels"
import type { DiceStyle } from "@/lib/dice-styles"

const TYPES = ["d4", "d6", "d8", "d10", "d100", "d12", "d20"]
// What the library made each die's labels from, kept so a style without drawn numerals can put them back.
const originals = new Map<string, string>()
const drawn = new Map<string, HTMLImageElement>()

type Labels = unknown[]

// Labels are plain text, or for the d4 lists of three.
const texts = (labels: Labels): string[] =>
  labels.flatMap((label) => (Array.isArray(label) ? texts(label) : typeof label === "string" && label !== "" ? [label] : []))

const replaced = (labels: Labels, make: (text: string) => unknown): Labels =>
  labels.map((label) => (Array.isArray(label) ? replaced(label, make) : typeof label === "string" && label !== "" ? make(label) : label))

function originalOf(box: DiceBox, type: string): Labels {
  if (!originals.has(type)) originals.set(type, JSON.stringify(box.DiceFactory.get(type).labels))
  return JSON.parse(originals.get(type)!)
}

// Draws every face of the style, once. Until it is done the style's dice use the library's own numerals.
export async function prepareLabels(box: DiceBox, style: DiceStyle) {
  const layout = style.labels
  if (!layout) return
  await Promise.all(
    typesOf(layout).flatMap((type) =>
      texts(originalOf(box, type)).map(async (text) => {
        drawn.set(`${style.id}/${type}/${text}`, await faceLabel(type, text, layout))
      })
    )
  )
}

// The library takes a die's labels from the shared die definition when it makes the die, so this is set
// just before dice are made, for every box at once.
export function applyLabels(box: DiceBox, style: DiceStyle) {
  for (const type of TYPES) {
    const labels = originalOf(box, type)
    const ready = style.labels && typesOf(style.labels).includes(type) && drawn.has(`${style.id}/${type}/${texts(labels)[0]}`)
    box.DiceFactory.get(type).labels = ready ? replaced(labels, (text) => drawn.get(`${style.id}/${type}/${text}`)) : labels
  }
}

// A style with drawn labels needs the d20's corners inside its texture, which its geometry builder is told to do.
export function applyFaceFit(box: DiceBox, style: DiceStyle) {
  setFaceFit(box, Boolean(style.labels) && faceFitAvailable())
}
