import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { NEW_CHARACTER_TEMPLATE } from "@/lib/character-templates"
import { errorMessage } from "@/lib/campaigns"
import { characterPath, createCharacter, UNTITLED_CHARACTER } from "@/lib/characters"

// Makes a character at once, named "Untitled character", and opens its sheet, where the
// name is waiting to be typed over. A failure is a toast, as there is no dialog.
export function useCreateCharacter() {
  const navigate = useNavigate()

  return useCallback(async () => {
    try {
      const character = await createCharacter(
        NEW_CHARACTER_TEMPLATE.id,
        NEW_CHARACTER_TEMPLATE.version,
        UNTITLED_CHARACTER
      )
      navigate(characterPath(character.id), { state: { justCreated: true } })
    } catch (failure) {
      toast.error(errorMessage(failure))
    }
  }, [navigate])
}
