import { useLocation } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacter } from "@/hooks/use-character"
import { useDiscardUntitledCharacter } from "@/hooks/use-discard-untitled-character"
import { characterPath } from "@/lib/characters"
import { QuickStart } from "./QuickStart"
import { sheetActions } from "./sheet-actions"
import { usePageTrail } from "./usePageTrail"

// The quick build of one character. Render with key={id}. The address keeps the "just
// created" state, so a new character that is left untouched still goes again.
export function QuickBuildPage({ id }: { id: string }) {
  const sheet = useCharacter(id)
  const { character } = sheet
  const { state } = useLocation()
  const userId = useAuth().session!.user.id
  const fresh = (state as { justCreated?: boolean } | null)?.justCreated === true
  useDiscardUntitledCharacter(fresh, character, sheet.fields, sheet.values)
  usePageTrail([
    { label: "Your library", to: "/app/library?section=characters" },
    { label: character?.name ?? "…", to: characterPath(id) },
    { label: "Start" },
  ])

  if (sheet.error && !character) return <FormAlert tone="error">{sheet.error}</FormAlert>
  if (character === undefined || !sheet.loaded) return <Skeleton className="h-24 w-full" />
  if (character === null) {
    return <p className="text-muted-foreground text-sm">This character does not exist, or is not yours.</p>
  }
  if (!sheet.template?.builder) {
    return <FormAlert tone="error">This character has no builder; open its sheet instead.</FormAlert>
  }

  return <QuickStart sheet={sheet} character={character} actions={sheetActions(sheet, id, userId)} userId={userId} />
}
