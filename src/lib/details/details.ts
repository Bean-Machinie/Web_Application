// What the detail brush lays down: paths, roads and water. They have a layer of their
// own over the biomes and never change them. Their paint is kept like the biomes': one
// weight to each of them for every cell, so there are as many as there are biomes.
export const DETAILS = ["path", "road", "river", "stream"] as const
export type Detail = (typeof DETAILS)[number]

// What the detail brush paints: one of them, or nothing, which clears them.
export type DetailBrush = Detail | "erase"

// Paths and rivers are thin, so details are kept to a cell of one canvas pixel.
export const DETAIL_CELL = 1

export const DETAIL_SIZE = { min: 2, max: 100, start: 16, step: 1.15 }

// The colour of each, and how much its ground varies about it, as a share of it.
// Placeholders until there are painted tiles for them.
export const DETAIL_LOOK: Record<Detail, { colour: [number, number, number]; grain: number }> = {
  path: { colour: [172, 140, 96], grain: 0.16 },
  road: { colour: [128, 122, 112], grain: 0.12 },
  river: { colour: [74, 128, 168], grain: 0.1 },
  stream: { colour: [118, 168, 198], grain: 0.1 },
}
