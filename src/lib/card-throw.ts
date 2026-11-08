// Where a card lies, in pixels and degrees.
export type CardPlace = { x: number; y: number; rotate: number }

// How far the card's path bows up from a straight line, for its length: a gentle arc.
const BOW = 0.16

const mix = (a: number, b: number, t: number) => a + (b - a) * t

// Where a dealt card is `e` of the way (0 to 1, already eased) from `from` to `to`: along a gentle arc
// that rises a little and comes down onto its landing, turning evenly to its angle as it goes, and how
// high it is off the table (0 to 1, highest midway), for its shadow.
export function throwPose(from: CardPlace, to: CardPlace, e: number) {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const bend = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - length * BOW }
  const [u, v, w] = [(1 - e) * (1 - e), 2 * e * (1 - e), e * e]
  return {
    x: u * from.x + v * bend.x + w * to.x,
    y: u * from.y + v * bend.y + w * to.y,
    rotate: mix(from.rotate, to.rotate, e),
    lift: Math.sin(Math.PI * e),
  }
}

// A card part way back from where it was dealt to the deck, `g` of the way there, in a straight line.
export const gatherPose = (landed: CardPlace, deck: CardPlace, g: number): CardPlace => ({
  x: mix(landed.x, deck.x, g),
  y: mix(landed.y, deck.y, g),
  rotate: mix(landed.rotate, deck.rotate, g),
})
