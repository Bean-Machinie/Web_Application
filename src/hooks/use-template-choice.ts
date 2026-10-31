import { useAuth } from "@/auth/useAuth"
import { DEFAULT_TEMPLATE_ID, TEMPLATE_CHOICES } from "@/lib/character-templates"
import { useStoredValue } from "./use-stored-value"

const read = (text: string | null) => TEMPLATE_CHOICES.find((candidate) => candidate.id === text)?.id ?? DEFAULT_TEMPLATE_ID

// The system chosen for the last new character, remembered per user in this browser, so
// the dialog opens on it.
export const useTemplateChoice = () => useStoredValue(`new-character-template:${useAuth().session!.user.id}`, read)
