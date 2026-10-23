import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { DEFAULT_TEMPLATE_ID, TEMPLATE_CHOICES } from "@/lib/character-templates"

// The system chosen for the last new character, remembered per user in this browser, so
// the dialog opens on it.
export function useTemplateChoice() {
  const storageKey = `new-character-template:${useAuth().session!.user.id}`
  const [choice, setChoice] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return TEMPLATE_CHOICES.some((candidate) => candidate.id === saved) ? saved! : DEFAULT_TEMPLATE_ID
    } catch {
      return DEFAULT_TEMPLATE_ID
    }
  })

  function change(next: string) {
    setChoice(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // The choice just will not be remembered.
    }
  }

  return [choice, change] as const
}
