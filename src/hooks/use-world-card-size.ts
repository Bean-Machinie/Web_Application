import { useStoredValue } from "./use-stored-value"

export type CardSize = "small" | "medium" | "large"

// The width of a card in the grid; as many columns as fit. A card and its 1rem gap are 224px
// at medium, which is exactly what the sidebar gives or takes when it opens or closes, so
// there it is always one card more or fewer on a row.
export const CARD_MIN_WIDTH: Record<CardSize, number> = { small: 152, medium: 208, large: 280 }

const KEY = "world-card-size"

const read = (text: string | null): CardSize => (text === "small" || text === "large" ? text : "medium")

// Remembered in this browser.
export const useWorldCardSize = () => useStoredValue(KEY, read)
