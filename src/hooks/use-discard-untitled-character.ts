import { useEffect, useRef } from "react"
import type { SheetField } from "@/lib/character-sheet"
import { deleteCharacter, UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character, StoredValue } from "@/lib/characters"

// A character that was just made and is left with its placeholder name and nothing else
// is deleted, quietly, like an entry. Only a `fresh` one, never one that was merely
// opened; what counts is read when the page is left, and only once it has loaded.
export function useDiscardUntitledCharacter(
  fresh: boolean,
  character: Character | null | undefined,
  fields: SheetField[],
  values: Record<string, StoredValue>
) {
  const latest = useRef({ character, fields, values })
  useEffect(() => {
    latest.current = { character, fields, values }
  })

  useEffect(() => {
    if (!fresh) return
    return () => {
      const { character, fields, values } = latest.current
      if (!character) return
      const untouched =
        character.name === UNTITLED_CHARACTER &&
        character.concept === "" &&
        character.portrait === null &&
        !fields.some((field) => field.custom) &&
        Object.values(values).every((stored) => stored.pinned === null && stored.value == null)
      if (untouched) deleteCharacter(character.id).catch(() => {})
    }
  }, [fresh])
}
