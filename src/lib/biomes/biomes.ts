// The biomes laid over the land. Land with no paint on it is plains.
export const BIOMES = ["ice", "swamp", "desert", "volcanic"] as const
export type Biome = (typeof BIOMES)[number]

// What the brush paints. Plains clears every biome, so there is no eraser.
export type BrushBiome = Biome | "plains"

// Paint is kept on a grid of cells this many canvas pixels wide. A soft brush
// has no detail finer than that, and the land's edge is cut sharp when drawn.
export const PAINT_CELL = 2
// Cells are grouped in square tiles, so a stroke only copies what it touches.
export const TILE = 64

// How strongly the blend brush softens, the share of full: subtle to start.
export const BLEND_STRENGTH = { min: 0.05, max: 1, start: 0.25 }
// How much of what the blend brush has picked up is pulled along the stroke:
// low to start.
export const BLEND_STRETCH = { min: 0, max: 1, start: 0.2 }

export const BRUSH_SIZE = { min: 20, max: 400, start: 120, step: 1.15 }
