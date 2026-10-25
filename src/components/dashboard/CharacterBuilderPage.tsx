import { useLocation } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacter } from "@/hooks/use-character"
import { useDiscardUntitledCharacter } from "@/hooks/use-discard-untitled-character"
import { characterPath } from "@/lib/characters"
import { CharacterBuilder } from "./CharacterBuilder"
import { usePageTrail } from "./usePageTrail"

// The builder for one character. Render with key={id}. A template without a builder has
// nothing to build, so its sheet is shown instead.
export function CharacterBuilderPage({ id }: { id: string }) {
  const sheet = useCharacter(id)
  const { character } = sheet
  const fresh = (useLocation().state as { justCreated?: boolean } | null)?.justCreated === true
  useDiscardUntitledCharacter(fresh, character, sheet.fields, sheet.values)
  usePageTrail([
    { label: "Your library", to: "/app/library?section=characters" },
    { label: character?.name ?? "…", to: characterPath(id) },
    { label: "Build" },
  ])

  if (sheet.error && !character) return <FormAlert tone="error">{sheet.error}</FormAlert>
  if (character === undefined || !sheet.loaded) return <Skeleton className="h-24 w-full" />
  if (character === null) {
    return <p className="text-muted-foreground text-sm">This character does not exist, or is not yours.</p>
  }
  if (!sheet.template?.builder) {
    return <FormAlert tone="error">This character has no builder; open its sheet instead.</FormAlert>
  }

  return <CharacterBuilder sheet={sheet} character={character} />
}
