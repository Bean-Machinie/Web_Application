import { useStoredValue } from "./use-stored-value"

export type CardSize = "small" | "medium" | "large"

// The least width of a card in the grid; as many columns as fit.
export const CARD_MIN_WIDTH: Record<CardSize, number> = { small: 150, medium: 200, large: 280 }

const KEY = "world-card-size"

const read = (text: string | null): CardSize => (text === "small" || text === "large" ? text : "medium")

// Remembered in this browser.
export const useWorldCardSize = () => useStoredValue(KEY, read)
