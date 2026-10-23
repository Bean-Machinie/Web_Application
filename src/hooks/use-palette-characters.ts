import { useEffect, useState } from "react"
import { fetchCharacters } from "@/lib/characters"
import type { Character } from "@/lib/characters"

// Your characters for the command palette, read each time it opens. If they cannot be
// read the palette just finds none.
export function usePaletteCharacters(open: boolean) {
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    if (!open) return
    let current = true
    fetchCharacters().then(
      (found) => current && setCharacters(found),
      () => current && setCharacters([])
    )
    return () => {
      current = false
    }
  }, [open])

  return characters
}
