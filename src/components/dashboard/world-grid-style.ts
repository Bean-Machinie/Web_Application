import type { CSSProperties } from "react"
import { CARD_MIN_WIDTH } from "@/hooks/use-world-card-size"
import type { CardSize } from "@/hooks/use-world-card-size"

// As many columns as fit, each exactly the card size and the gap always the same: a card is
// never stretched, and more room only brings another card onto the row. What does not make
// a whole card is left at the right, so the cards start at the left edge. Wide cards (maps) are
// half as wide again.
export const gridStyle = (size: CardSize, wide = false): CSSProperties => ({
  gridTemplateColumns: `repeat(auto-fill, ${CARD_MIN_WIDTH[size] * (wide ? 1.6 : 1)}px)`,
  justifyContent: "start",
})
