import { useEffect, useState } from "react"
import { summarize } from "@/lib/character-summary"
import type { CharacterSummary } from "@/lib/character-summary"
import { fetchCharacterValues } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { useCharacters } from "./use-characters"

export type CharacterCardData = { character: Character; summary: CharacterSummary | null }

// Your characters with what their cards say; null until the characters have loaded. A summary that
// cannot be read is null, and the card shows the concept instead.
export function useCharacterCards() {
  const { characters, error } = useCharacters()
  const [summaries, setSummaries] = useState<Map<string, CharacterSummary | null>>(new Map())

  useEffect(() => {
    if (!characters) return
    let current = true
    Promise.all(
      characters.map((character) =>
        fetchCharacterValues(character.id).then(
          (values) => [character.id, summarize(character, values)] as const,
          () => [character.id, null] as const
        )
      )
    ).then((list) => current && setSummaries(new Map(list)))
    return () => {
      current = false
    }
  }, [characters])

  const cards: CharacterCardData[] | null = characters && characters.map((character) => ({ character, summary: summaries.get(character.id) ?? null }))
  return { cards, error }
}
