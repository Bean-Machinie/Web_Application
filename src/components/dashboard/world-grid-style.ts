import type { CSSProperties } from "react"
import { CARD_MIN_WIDTH } from "@/hooks/use-world-card-size"
import type { CardSize } from "@/hooks/use-world-card-size"

// As many columns as fit, none narrower than the card size.
export const gridStyle = (size: CardSize): CSSProperties => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH[size]}px, 1fr))`,
})
