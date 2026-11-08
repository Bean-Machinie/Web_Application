// How far the reel leans, in degrees: it rises from the tile's bottom left toward its top middle.
export const REEL_SLANT = -28
// How far apart the cards are, in card widths.
export const REEL_SPACING = 0.78

// How far a card of the reel is from the middle, in cards (negative to the left), wrapping around
// so the reel never ends.
export function reelPosition(index: number, offset: number, count: number) {
  const shifted = (((index - offset + count / 2) % count) + count) % count
  return shifted - count / 2
}

export type ReelPose = { x: number; opacity: number; zIndex: number }

// Where a card sits, `pos` cards from the middle and `width` wide, laid out like a hand spread on a
// table: each card lying over the one before it, so a card only ever covers its left neighbour and the
// order never changes. Those about to wrap round fade out.
export function reelPose(pos: number, width: number, count: number): ReelPose {
  return {
    x: pos * width * REEL_SPACING,
    opacity: Math.max(0, Math.min(1, (count / 2 - Math.abs(pos)) / 0.8)),
    zIndex: Math.round(100 + pos * 10),
  }
}
