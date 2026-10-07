import { LINE_WEIGHT } from "./map-theme"

// How all of a map's land looks. These are applied when the land is drawn, so
// they change what is already there too, and the land itself stays as drawn.
export type MapStyle = {
  // 0 is the drawn outline as it is, 1 has every corner rounded off.
  roundness: number
  // The ink line along the coast, in canvas pixels.
  outline: number
  // The water around the land: how many lines spread out from the coast, how
  // wide they are and how far apart, in canvas pixels, and how much all of that
  // varies at random across the map.
  rings: number
  thickness: number
  spacing: number
  variation: number
}

export const STYLE_LIMITS = {
  roundness: { min: 0, max: 1, step: 0.01 },
  outline: { min: 0, max: 10, step: 0.5 },
  rings: { min: 0, max: 8, step: 1 },
  thickness: { min: 1, max: 12, step: 0.5 },
  spacing: { min: 10, max: 70, step: 1 },
  variation: { min: 0, max: 1, step: 0.01 },
}

export const DEFAULT_STYLE: MapStyle = {
  roundness: 0.2,
  outline: LINE_WEIGHT,
  rings: 4,
  thickness: 2.5,
  spacing: 10,
  variation: 0.5,
}

// Maps made before the style existed hold land that was already smoothed when
// it was drawn, so smoothing it again would change how it looks.
const LEGACY_STYLE: MapStyle = { ...DEFAULT_STYLE, roundness: 0 }

const within = (value: unknown, key: keyof MapStyle, fallback: number) => {
  const { min, max } = STYLE_LIMITS[key]
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback
}

export function readStyle(json: unknown): MapStyle {
  const style = json as (Partial<MapStyle> & { waviness?: number }) | null
  if (typeof style !== "object" || style === null) return LEGACY_STYLE
  const read = (key: keyof MapStyle) => within(style[key], key, DEFAULT_STYLE[key])
  return {
    roundness: read("roundness"),
    outline: read("outline"),
    rings: Math.round(read("rings")),
    thickness: read("thickness"),
    spacing: read("spacing"),
    // Maps saved before it was renamed hold the same idea as "waviness".
    variation: within(style.variation ?? style.waviness, "variation", DEFAULT_STYLE.variation),
  }
}
