import { useStoredValue } from "./use-stored-value"

const STORAGE_KEY = "quick-build:suggestions"

const write = (show: boolean) => (show ? "on" : "off")

// Whether the sentence shows the word it suggests, remembered in this browser. On unless turned off.
export const useShowSuggestions = () => useStoredValue(STORAGE_KEY, (text) => text !== "off", write)
