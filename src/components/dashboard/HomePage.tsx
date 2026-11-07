import { Loader2 } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { useCharacterCards } from "@/hooks/use-character-cards"
import { useStoredValue } from "@/hooks/use-stored-value"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { storage } from "@/lib/browser-storage"
import { lastOpenedCampaign } from "@/lib/last-opened"
import { compendiumVisitedKey } from "@/lib/onboarding"
import { loadRecents } from "@/lib/recent-items"
import { HomeChecklist } from "./HomeChecklist"
import type { ChecklistStep } from "./HomeChecklist"
import { HomeCharacters } from "./HomeCharacters"
import { HomeCreate } from "./HomeCreate"
import { HomeHero } from "./HomeHero"
import { HomeRecent } from "./HomeRecent"
import { useCampaign } from "./useCampaign"
import { useNewCharacter } from "./useNewCharacter"
import { useWorldScope } from "./useWorldScope"

const readFlag = (text: string | null) => text === "1"
const writeFlag = (flag: boolean) => (flag ? "1" : "0")

// Where you land, made to fit one screen: the hero (the way back into the campaign you were last in, or
// for someone new a way in), the ways to create, and your characters; and at the right what you edited
// last, or the first steps while they are not done.
export function HomePage() {
  const userId = useAuth().session!.user.id
  const { campaigns, loading, error } = useCampaign()
  const { cards, error: charactersError } = useCharacterCards()
  const { entries, error: entriesError } = useWorldEntries(useWorldScope())
  const newCharacter = useNewCharacter()
  const [dismissed, setDismissed] = useStoredValue(`home-checklist-dismissed:${userId}`, readFlag, writeFlag)

  const failure = error ?? charactersError ?? entriesError
  const ready = !loading && (cards !== null || charactersError !== null) && (entries !== null || entriesError !== null)

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {failure ? <FormAlert tone="error">{failure}</FormAlert> : <Loader2 className="text-muted-foreground size-5 animate-spin" />}
      </div>
    )
  }

  const characters = cards ?? []
  const resume = lastOpenedCampaign(loadRecents(userId), campaigns)
  const steps: ChecklistStep[] = [
    { label: "Create a character", done: characters.length > 0, onClick: newCharacter.open },
    { label: "Join or start a campaign", done: campaigns.length > 0, to: "/app/campaigns" },
    { label: "Try the Map Maker", done: (entries ?? []).some((entry) => entry.kind === "map"), to: "/app/library?create=map" },
    { label: "Browse the Compendium", done: storage.getItem(compendiumVisitedKey(userId)) === "1", to: "/app/compendium" },
  ]
  const showSteps = !dismissed && steps.some((step) => !step.done)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-2 py-2 md:px-6">
      {failure && <FormAlert tone="error">{failure}</FormAlert>}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-8">
          <HomeHero campaign={resume} onCreateCharacter={newCharacter.open} />
          <HomeCreate entries={entries} onNewCharacter={newCharacter.open} />
          <HomeCharacters cards={characters} onCreate={newCharacter.open} />
        </div>
        {showSteps ? <HomeChecklist steps={steps} onDismiss={() => setDismissed(true)} /> : <HomeRecent />}
      </div>
      {newCharacter.dialog}
    </div>
  )
}
