import { useLocation } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacter } from "@/hooks/use-character"
import { useDiscardUntitledCharacter } from "@/hooks/use-discard-untitled-character"
import { CharacterSheet } from "./CharacterSheet"
import { usePageTrail } from "./usePageTrail"

// A character's sheet. Render with key={id} so moving between characters starts over.
export function CharacterPage({ id }: { id: string }) {
  const sheet = useCharacter(id)
  const { character } = sheet
  // Set by the quick create: the name opens for typing, and the character goes again if
  // it is left unnamed and empty.
  const fresh = (useLocation().state as { justCreated?: boolean } | null)?.justCreated === true
  useDiscardUntitledCharacter(fresh, character, sheet.fields, sheet.values)
  usePageTrail([{ label: "Your library", to: "/app/library?section=characters" }, { label: character?.name ?? "…" }])

  if (sheet.error && !character) return <FormAlert tone="error">{sheet.error}</FormAlert>
  if (character === undefined || !sheet.loaded) return <Skeleton className="h-24 w-full" />
  if (character === null) {
    return <p className="text-muted-foreground text-sm">This character does not exist, or is not yours.</p>
  }
  if (!sheet.template) {
    return <FormAlert tone="error">This character was made with a newer version of the sheet.</FormAlert>
  }

  return <CharacterSheet sheet={sheet} character={character} fresh={fresh} />
}
