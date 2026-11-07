import type { CSSProperties } from "react"
import { CARD_MIN_WIDTH } from "@/hooks/use-world-card-size"
import type { CardSize } from "@/hooks/use-world-card-size"

// As many columns as fit, each exactly the card size: a card is never stretched. What does not
// make a whole card widens the gaps instead (never under the gap-4 minimum), so the first and last
// cards sit on the same edges as the toolbar above. Wide cards (maps) are half as wide again.
export const gridStyle = (size: CardSize, wide = false): CSSProperties => ({
  gridTemplateColumns: `repeat(auto-fill, ${CARD_MIN_WIDTH[size] * (wide ? 1.6 : 1)}px)`,
  justifyContent: "space-between",
})
