// A ring of cards seen from the front, as in a carousel that goes round. `place` is how far a
// card is from the front, in cards, and may be fractional while the ring turns: 0 is dead
// centre, and the cards at the far side, half the ring away, sit behind it.

const BACK_ROTATION_DEG = 7
// How far the cards at the back rise above the front one, as a share of a card's width.
const RISE_PER_WIDTH = 0.55
// What a card's caption adds under its square picture, and the room left for it to lift on hover.
const CAPTION_PX = 64
const HOVER_ROOM_PX = 24
const MIN_CARD_PX = 110
const MAX_CARD_PX = 340

export type RingPose = {
  x: number
  y: number
  scale: number
  opacity: number
  rotate: number
  // Whole numbers, so nearer cards paint over the farther.
  layer: number
}

// The widest card that fits, with the ring's back cards rising above it, in a stage this tall.
export function cardWidthFor(stageHeight: number) {
  const fit = (stageHeight - CAPTION_PX - HOVER_ROOM_PX) / (1 + RISE_PER_WIDTH)
  return Math.round(Math.min(Math.max(fit, MIN_CARD_PX), MAX_CARD_PX))
}

export const riseFor = (cardWidth: number) => cardWidth * RISE_PER_WIDTH

// How far round the ring a card is, in radians, with `count` cards spaced evenly.
const angleOf = (place: number, count: number) => (place * 2 * Math.PI) / count

// 1 at the front, 0 at the back.
const nearness = (place: number, count: number) => (Math.cos(angleOf(place, count)) + 1) / 2

export function ringPose(place: number, count: number, radius: number, rise: number): RingPose {
  const angle = angleOf(place, count)
  const near = nearness(place, count)
  return {
    x: Math.sin(angle) * radius,
    // The cards behind rise above the front one, so the whole ring can be seen.
    y: -(1 - near) * rise,
    scale: 0.5 + 0.5 * near ** 1.4,
    opacity: 0.4 + 0.6 * near,
    rotate: Math.sin(angle) * BACK_ROTATION_DEG,
    layer: Math.round(near * 100),
  }
}

// The fewest steps, and which way, to bring `index` to the front from `active`. Halfway round
// goes backwards.
export function shortestStep(index: number, active: number, count: number) {
  const half = Math.floor(count / 2)
  return ((index - active + count + half) % count) - half
}
