import { BRUSH_SIZE } from "./biomes/biomes"
import { DETAIL_SIZE } from "./details/details"

// What the eraser takes away: the biomes (back to plains), the details, or art.
export const ERASE_TARGETS = ["biomes", "details", "assets"] as const
export type EraseTarget = (typeof ERASE_TARGETS)[number]

// How big the eraser can be for each, which each remembers. Art is not painted, so
// its eraser can be small enough to pick one piece out of a crowd.
export const ERASE_SIZE: Record<EraseTarget, { min: number; max: number; start: number; step: number }> = {
  biomes: BRUSH_SIZE,
  details: DETAIL_SIZE,
  assets: { min: 4, max: 400, start: 40, step: 1.15 },
}
