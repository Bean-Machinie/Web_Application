import { useEffect, useRef } from "react"
import { readSuggested, SUGGESTED_FIELD } from "@/lib/quick-state"
import type { StoredValue } from "@/lib/characters"

// Takes a marker off a value the player has now chosen themselves. Several can go in one
// go (changing the class clears many picks), so the list is kept between those calls
// until the next render has the stored one.
export function useSuggested(values: Record<string, StoredValue>, setValue: (fieldId: string, value: unknown) => void) {
  const pending = useRef<string[] | null>(null)
  useEffect(() => {
    pending.current = null
  }, [values])

  return (marker: string) => {
    const current = pending.current ?? readSuggested(values)
    if (!current.includes(marker)) return
    const next = current.filter((key) => key !== marker)
    pending.current = next
    // An empty list stays: it says the character was built quickly.
    setValue(SUGGESTED_FIELD, next)
  }
}
