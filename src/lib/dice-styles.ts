export type DiceStyle = {
  id: string
  label: string
  // The library caches colorsets by name, so each one needs a name of its own, and never "white".
  name: string
  background: string
  foreground: string
  edge: string
  outline: string
  texture: "none"
  material: "none"
  // Plastic's shininess; the library's own default when left out.
  shininess?: number
}

export const DEFAULT_SHININESS = 5

type Colors = Pick<DiceStyle, "id" | "label" | "background" | "foreground" | "edge" | "shininess">

const style = (colors: Colors): DiceStyle => ({
  ...colors,
  name: `style-${colors.id}`,
  outline: "none",
  texture: "none",
  material: "none",
})

export const DICE_STYLES: DiceStyle[] = [
  style({ id: "charcoal", label: "Charcoal", background: "#2b2b2f", foreground: "#ffffff", edge: "#55555c" }),
  style({ id: "ivory", label: "Ivory", background: "#e9e0cc", foreground: "#1c1a17", edge: "#f6efde" }),
  style({ id: "obsidian", label: "Obsidian", background: "#0c0c0e", foreground: "#d4af37", edge: "#2e2e34", shininess: 80 }),
  style({ id: "pewter", label: "Pewter", background: "#aab4c0", foreground: "#1d2530", edge: "#c8d0da" }),
  style({ id: "midnight", label: "Midnight", background: "#2f3a4f", foreground: "#c9d1de", edge: "#4a5870" }),
  style({ id: "oxblood", label: "Oxblood", background: "#5a1620", foreground: "#f3ead6", edge: "#7d2a36" }),
]

export const findDiceStyle = (id: string | null) => DICE_STYLES.find((style) => style.id === id) ?? DICE_STYLES[0]
