import { useLocation, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacter } from "@/hooks/use-character"
import { useDiscardUntitledCharacter } from "@/hooks/use-discard-untitled-character"
import { characterPath } from "@/lib/characters"
import { QUICK_KINDS } from "@/lib/quick-options"
import { QuickOptions } from "./QuickOptions"
import { QuickStart } from "./QuickStart"
import { sheetActions } from "./sheet-actions"
import { usePageTrail } from "./usePageTrail"

// The quick build of one character. Render with key={id}. The start page and the option pages
// are one page, told apart by ?pick=, so the character is loaded once and a new one that is
// left untouched still goes again. The address keeps the "just created" state between them.
export function QuickBuildPage({ id }: { id: string }) {
  const sheet = useCharacter(id)
  const { character } = sheet
  const { state } = useLocation()
  const userId = useAuth().session!.user.id
  const [params, setParams] = useSearchParams()
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

  const actions = sheetActions(sheet, id, userId)
  const kind = QUICK_KINDS.find((candidate) => candidate === params.get("pick"))
  const go = (pick?: string) => setParams(pick ? { pick } : {}, { state })

  return kind ? (
    <QuickOptions key={kind} kind={kind} actions={actions} onBack={() => go()} />
  ) : (
    <QuickStart sheet={sheet} character={character} actions={actions} userId={userId} onPick={go} />
  )
}
