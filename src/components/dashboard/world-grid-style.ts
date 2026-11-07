import type { CSSProperties } from "react"

// A card is never narrower than this, and its image keeps its aspect ratio at any width, so a card
// only ever scales. Wide cards (maps) are 1.6 times as wide.
const MIN = 152

// As many columns as fit at MIN, with the gap-4 gap always the same: all the free width goes to
// the cards, which grow together, so a panel being dragged resizes them smoothly and the first and
// last sit on the toolbar's edges. A new column comes in when one more card fits at MIN.
export const gridStyle = (wide = false): CSSProperties => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${MIN * (wide ? 1.6 : 1)}px, 1fr))`,
})
