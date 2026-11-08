import type { Buf, Rgb } from "./buffer"
import { ash } from "./ash"
import type { Effect } from "./effect"
import { embers } from "./embers"
import { motes } from "./motes"
import { seeded } from "./noise"
import { bricks, ridges, vines } from "./textures"

export type ArtKind = "embers" | "motes" | "ash"

type Art = {
  // The particles, for a picture of this size.
  effect: (w: number, h: number, seed: number) => Effect
  // The texture under them, laid down once.
  texture: (buf: Buf, ink: Rgb, seed: number) => void
}

// Each card's art: a kind of particle over a texture. The renderer treats them all alike.
export const ART: Record<ArtKind, Art> = {
  embers: { effect: (w, h, seed) => embers(w, h, seeded(seed)), texture: bricks },
  motes: { effect: (w, h, seed) => motes(w, h, seeded(seed), seed), texture: vines },
  ash: { effect: (w, h, seed) => ash(w, h, seeded(seed)), texture: ridges },
}
