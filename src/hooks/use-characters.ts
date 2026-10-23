import { useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { fetchCharacters } from "@/lib/characters"
import type { Character } from "@/lib/characters"

// Your characters, newest changes first; null until they have loaded.
export function useCharacters() {
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacters()
      .then(setCharacters)
      .catch((failure) => setError(errorMessage(failure)))
  }, [])

  return { characters, error }
}
