import type { LabelLayout } from "@/lib/dice-labels"

export type DiceStyle = {
  id: string
  label: string
  // The library caches colorsets by name, so each one needs a name of its own, and never "white".
  name: string
  background: string
  foreground: string
  edge: string
  outline: string
  // A texture from the library's own list, which brings its material unless one is given.
  texture: string
  material?: string
  // Still on trial; the picker says so.
  experimental?: boolean
  // The numerals are drawn pictures in this layout (see dice-labels.ts) instead of the library's text.
  labels?: LabelLayout
  // Plastic's shininess; the library's own default when left out.
  shininess?: number
  // How strongly plastic mirrors the light, as a colour: a bright one gives glare.
  specular?: number
}

export const DEFAULT_SHININESS = 5
export const DEFAULT_SPECULAR = 0x4d4d4d

// The factory gives a die its gloss when it makes it, so this is set before every die, from every style.
export function glossOf(style: DiceStyle) {
  return { shininess: style.shininess ?? DEFAULT_SHININESS, specular: style.specular ?? DEFAULT_SPECULAR }
}

type Colors = Pick<DiceStyle, "id" | "label" | "background" | "foreground" | "edge" | "shininess" | "specular">

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
  style({ id: "obsidian", label: "Obsidian", background: "#0c0c0e", foreground: "#d4af37", edge: "#2e2e34", shininess: 80, specular: 0x8a8a8a }),
  style({ id: "pewter", label: "Pewter", background: "#aab4c0", foreground: "#1d2530", edge: "#c8d0da" }),
  style({ id: "midnight", label: "Midnight", background: "#2f3a4f", foreground: "#c9d1de", edge: "#4a5870" }),
  style({ id: "oxblood", label: "Oxblood", background: "#5a1620", foreground: "#f3ead6", edge: "#7d2a36" }),
]

const textured = (look: Pick<DiceStyle, "id" | "label" | "background" | "foreground" | "edge" | "texture">): DiceStyle => ({
  ...look,
  name: `style-${look.id}`,
  outline: "none",
})

// The library's own marble, bronze and "astralsea" looks; the textures are copied to public/dice-textures.
export const EXPERIMENTAL_STYLES: DiceStyle[] = ([
  textured({ id: "marble", label: "Marble", background: "#c9ccd1", foreground: "#1f2328", edge: "#dfe2e6", texture: "marble" }),
  textured({ id: "bronze", label: "Bronze", background: "#b08d57", foreground: "#1a1209", edge: "#c9a56c", texture: "bronze03" }),
  textured({ id: "astral", label: "Astral", background: "white", foreground: "#565656", edge: "white", texture: "astral" }),
  { ...textured({ id: "arcane", label: "Arcane", background: "#1d3a3c", foreground: "#d4af37", edge: "#16302f", texture: "none" }), material: "glass", labels: "engraved" as const },
  // Obsidian with a gold edge: the bevel faces take the edge colour and the same gloss as the body.
  { ...style({ id: "obsidian-gilt", label: "Obsidian Gilt", background: "#0c0c0e", foreground: "#d4af37", edge: "#c9a441", shininess: 80, specular: 0x8a8a8a }), labels: "caps" as const },
]).map((style) => ({ ...style, experimental: true }))

export const ALL_DICE_STYLES = [...DICE_STYLES, ...EXPERIMENTAL_STYLES]

export const findDiceStyle = (id: string | null) => ALL_DICE_STYLES.find((style) => style.id === id) ?? DICE_STYLES[0]
