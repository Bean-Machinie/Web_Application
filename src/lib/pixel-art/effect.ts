import type { Buf } from "./buffer"

// One animated effect of particles. It is stepped once per frame and then draws itself onto a buffer
// that already holds the card's texture. Nothing it draws is blurred or blended: every pixel is one of
// its few colours, or nothing.
export type Effect = {
  step: () => void
  draw: (buf: Buf) => void
}

// The frames a second the effects are made for.
export const FPS = 24

// How many particles to make for a picture of this size, given how many suit one of 160 by 80.
export const countFor = (w: number, h: number, base: number) => Math.max(4, Math.round((base * w * h) / (160 * 80)))
