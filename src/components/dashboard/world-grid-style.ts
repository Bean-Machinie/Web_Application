import type { CSSProperties } from "react"
import { CARD_MIN_WIDTH } from "@/hooks/use-world-card-size"
import type { CardSize } from "@/hooks/use-world-card-size"

// As many columns as fit, none narrower than the card size.
// Wide cards (maps) are half as wide again.
export const gridStyle = (size: CardSize, wide = false): CSSProperties => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH[size] * (wide ? 1.6 : 1)}px, 1fr))`,
})
