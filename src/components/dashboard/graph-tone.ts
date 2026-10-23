// How strongly the graph is drawn in each theme. Light ink on a pale page reads weaker
// than pale ink on a dark one, so light draws its lines and dots stronger and fades
// the entries that are not the point less.
export type GraphTone = {
  // Lines and grid dots: which theme colour, and how opaque.
  linkColor: "foreground" | "mutedForeground"
  linkAlpha: number
  dotColor: "foreground" | "mutedForeground"
  dotAlpha: number
  // What an entry hidden from players is drawn at.
  hidden: number
  // What the entries that are not the point fade to: when another is hovered or the
  // search skips them, and when a selection puts them out of focus.
  dimmed: number
  outOfFocus: number
}

const DARK: GraphTone = {
  linkColor: "mutedForeground",
  linkAlpha: 0.45,
  dotColor: "mutedForeground",
  dotAlpha: 0.5,
  hidden: 0.6,
  dimmed: 0.2,
  outOfFocus: 0.06,
}

const LIGHT: GraphTone = {
  linkColor: "foreground",
  linkAlpha: 0.35,
  dotColor: "foreground",
  dotAlpha: 0.5,
  hidden: 0.8,
  dimmed: 0.35,
  outOfFocus: 0.12,
}

export const graphTone = (dark: boolean) => (dark ? DARK : LIGHT)
