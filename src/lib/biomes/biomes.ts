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

export const BRUSH_SIZE = { min: 20, max: 400, start: 120, step: 1.15 }
