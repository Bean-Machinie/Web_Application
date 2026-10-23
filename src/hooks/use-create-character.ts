import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { TEMPLATE_CHOICES } from "@/lib/character-templates"
import { errorMessage } from "@/lib/campaigns"
import { characterPath, createCharacter, UNTITLED_CHARACTER } from "@/lib/characters"

// Makes a character from a template at once, named "Untitled character", and opens its
// sheet, where the name is waiting to be typed over. A failure is a toast, and resolves
// to false so a dialog can stay open.
export function useCreateCharacter() {
  const navigate = useNavigate()

  return useCallback(
    async (templateId: string) => {
      const choice = TEMPLATE_CHOICES.find((candidate) => candidate.id === templateId) ?? TEMPLATE_CHOICES[0]
      try {
        const character = await createCharacter(choice.id, choice.version, UNTITLED_CHARACTER)
        navigate(characterPath(character.id), { state: { justCreated: true } })
        return true
      } catch (failure) {
        toast.error(errorMessage(failure))
        return false
      }
    },
    [navigate]
  )
}
