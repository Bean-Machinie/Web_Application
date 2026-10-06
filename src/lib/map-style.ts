// How all of a map's land looks. These are applied when the land is drawn, so
// they change what is already there too, and the land itself stays as drawn.
export type MapStyle = {
  // 0 is the drawn outline as it is, 1 has every corner rounded off.
  roundness: number
  // The ink line along the coast, in canvas pixels.
  outline: number
  // The water around the land: how many wavy lines spread out from the coast,
  // how far apart they are in canvas pixels, and how much they wander.
  rings: number
  spacing: number
  waviness: number
}

export const STYLE_LIMITS = {
  roundness: { min: 0, max: 1, step: 0.01 },
  outline: { min: 0, max: 10, step: 0.5 },
  rings: { min: 0, max: 8, step: 1 },
  spacing: { min: 14, max: 70, step: 1 },
  waviness: { min: 0, max: 1, step: 0.01 },
}

export const DEFAULT_STYLE: MapStyle = {
  roundness: 0.8,
  outline: 3,
  rings: 5,
  spacing: 34,
  waviness: 0.5,
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
  const style = json as Partial<MapStyle> | null
  if (typeof style !== "object" || style === null) return LEGACY_STYLE
  const read = (key: keyof MapStyle) => within(style[key], key, DEFAULT_STYLE[key])
  return {
    roundness: read("roundness"),
    outline: read("outline"),
    rings: Math.round(read("rings")),
    spacing: read("spacing"),
    waviness: read("waviness"),
  }
}
