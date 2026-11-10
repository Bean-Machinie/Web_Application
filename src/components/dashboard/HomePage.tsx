import type { CSSProperties } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { useCharacterCards } from "@/hooks/use-character-cards"
import { useStoredValue } from "@/hooks/use-stored-value"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { storage } from "@/lib/browser-storage"
import { openedAt, recentCampaigns } from "@/lib/last-opened"
import { compendiumVisitedKey } from "@/lib/onboarding"
import { loadRecents } from "@/lib/recent-items"
import { HomeChecklist } from "./HomeChecklist"
import type { ChecklistStep } from "./HomeChecklist"
import { HomeBento } from "./HomeBento"
import { HomeRecent } from "./HomeRecent"
import { useCampaign } from "./useCampaign"
import { useNewCharacter } from "./useNewCharacter"
import { useWorldScope } from "./useWorldScope"

const readFlag = (text: string | null) => text === "1"
const writeFlag = (flag: boolean) => (flag ? "1" : "0")

// Where you land, made to fit one screen: a grid of tiles (the way back into your last campaign, or for
// someone new a way in, your latest character and the ways to create); and at the right what you
// edited last, or the first steps while they are not done.
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
  const recents = loadRecents(userId)
  const [last] = recentCampaigns(recents, campaigns, 1)
  const steps: ChecklistStep[] = [
    { label: "Create a character", done: characters.length > 0, onClick: newCharacter.open },
    { label: "Join or start a campaign", done: campaigns.length > 0, to: "/app/campaigns" },
    { label: "Try the Map Maker", done: (entries ?? []).some((entry) => entry.kind === "map"), to: "/app/library?create=map" },
    { label: "Browse the Compendium", done: storage.getItem(compendiumVisitedKey(userId)) === "1", to: "/app/compendium" },
  ]
  const showSteps = !dismissed && steps.some((step) => !step.done)

  return (
    // From right under the header to the very bottom of the window, over the layout's padding, so the
    // scrolling bento runs to both edges instead of vanishing into a strip of background. A bento cell is
    // a third of 85% of the width the 320px column at the right leaves, less the two gaps, never under
    // 180px; taller than the window, only the bento scrolls, with no bar showing.
    <div
      className="@container relative flex w-full flex-col px-2 py-2 md:px-6 lg:-my-6 lg:h-[calc(100dvh-var(--header-height))] lg:py-0"
      style={{ "--bento-h": "max(180px, ((100cqw - 2rem - 320px) * 0.85 - 32px) / 3)" } as CSSProperties}
    >
      {/* A soft shadow under the header, which the tiles scroll beneath; across the layout's padding too. */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-6 top-0 z-20 hidden h-12 bg-gradient-to-b from-black/25 to-transparent lg:block dark:from-black/55" />
      {failure && <FormAlert tone="error">{failure}</FormAlert>}
      <div className="grid gap-10 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)] lg:gap-8">
        {/* Padded out and pulled back at the sides, so a hot tile's lift and its flying cards are not cut off. */}
        <div className="min-w-0 lg:-mx-3 lg:overflow-y-auto lg:px-3 lg:pt-8 lg:pb-6 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <HomeBento campaign={last ?? null} openedAt={last ? openedAt(recents, last.id) : null} cards={characters} entries={entries} onNewCharacter={newCharacter.open} />
        </div>
        <div className="lg:grid lg:grid-rows-[minmax(0,1fr)] lg:pt-8">{showSteps ? <HomeChecklist steps={steps} onDismiss={() => setDismissed(true)} /> : <HomeRecent />}</div>
      </div>
      {newCharacter.dialog}
    </div>
  )
}
