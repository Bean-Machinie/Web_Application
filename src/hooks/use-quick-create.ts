import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import type { SheetActions } from "@/components/dashboard/character-actions"
import { characterPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { CREATED_FIELD } from "@/lib/quick-state"
import type { useCharacter } from "./use-character"

// Create character: marks the character as made, and opens its sheet once every value is saved,
// since the sheet reads the character afresh.
export function useQuickCreate(sheet: ReturnType<typeof useCharacter>, actions: SheetActions, character: Character) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (creating && sheet.saveState === "saved" && !sheet.error) navigate(characterPath(character.id), { state })
  }, [creating, sheet.saveState, sheet.error, navigate, character.id, state])

  return {
    busy: creating && !sheet.error,
    create: () => {
      actions.onValue(CREATED_FIELD, true)
      setCreating(true)
    },
  }
}
