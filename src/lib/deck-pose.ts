// How the cards of a deck sit: the front one flat, the others behind it, each further right, a little
// higher, smaller and darker, like cards stacked one behind another. They lie flat until pointed at. Two poses are
// kept apart: where a card is in the deck (its rank), which the pointer cannot change, so the area
// the pointer has to be in never moves; and how far it has come out toward the pointer.

// How much of each card behind the front one shows at the right, in pixels. Enough to see its fire and
// its name and to point at it easily.
export const PEEK_PX = 150

export type RankPose = { x: number; y: number; scale: number; rotate: number; filter: string }
export type LiftPose = { x: number; y: number; scale: number; rotate: number }

// `rank` is how far behind the front a card is (0 is the front). `shifted` is the front card when
// another is coming out, which gives it room and dims it.
export function rankPose(rank: number, shifted: boolean): RankPose {
  if (rank === 0) return { x: shifted ? -12 : 0, y: 0, scale: 1, rotate: 0, filter: `brightness(${shifted ? 0.88 : 1})` }
  return { x: PEEK_PX * rank, y: -8 * rank, scale: 1 - 0.045 * rank, rotate: 0, filter: `brightness(${1 - 0.1 * rank})` }
}

// A card that is `hot` (the pointer is on it, or it has focus) comes out of the deck: up, a little
// to the right, larger and turned up more. The front card only rises a touch.
export function liftPose(rank: number, hot: boolean): LiftPose {
  if (!hot) return { x: 0, y: 0, scale: 1, rotate: 0 }
  return rank === 0 ? { x: 0, y: -3, scale: 1, rotate: 0 } : { x: 26, y: -12, scale: 1.025, rotate: -1.4 }
}
