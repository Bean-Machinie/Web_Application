// What the detail brush lays down: paths, gravel and a river. They have a layer of their
// own over the biomes and never change them. Their paint is kept like the biomes': one
// weight to each of them for every cell, in as many places as there are biomes, of which the
// last is not used now (it was the stream's: see mergeStreams).
export const DETAILS = ["path", "gravel", "river"] as const
export type Detail = (typeof DETAILS)[number]

// What the detail brush paints: one of them, or nothing, which clears them.
export type DetailBrush = Detail | "erase"

// The place the river has in a tile's cells, for what is drawn by its own rules.
export const RIVER = DETAILS.indexOf("river")

// Paths and rivers are thin, so details are kept to a cell of one canvas pixel.
export const DETAIL_CELL = 1

// How far past the coast details can be painted, in canvas pixels, so that a river can run on out
// to sea. The path and the gravel are only drawn on the land; the river is drawn out into
// the sea, and fades into it over this distance.
export const DETAIL_REACH = 48

export const DETAIL_SIZE = { min: 2, max: 100, start: 16, step: 1.15 }

// The colour of each, and how much its ground varies about it, as a share of it. A river is
// the sea's own ground, so its colour is only what its brush is shown in.
// The path and the gravel are drawn from painted tiles (see detailGrounds); the colour is
// what their brush is shown in.
export const DETAIL_LOOK: Record<Detail, { colour: [number, number, number]; grain: number }> = {
  path: { colour: [172, 140, 96], grain: 0.16 },
  gravel: { colour: [128, 122, 112], grain: 0.12 },
  river: { colour: [74, 128, 168], grain: 0.1 },
}
