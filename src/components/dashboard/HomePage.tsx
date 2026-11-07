import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAccountDialog } from "@/components/auth/useAccountDialog"
import { useCharacterCards } from "@/hooks/use-character-cards"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { lastOpenedCampaign } from "@/lib/last-opened"
import { loadRecents } from "@/lib/recent-items"
import { HomeCharacters } from "./HomeCharacters"
import { HomeContinue } from "./HomeContinue"
import { HomeCreate } from "./HomeCreate"
import { HomeRecent } from "./HomeRecent"
import { HomeWelcome } from "./HomeWelcome"
import { JoinCampaignDialog } from "./JoinCampaignDialog"
import { useCampaign } from "./useCampaign"
import { useNewCharacter } from "./useNewCharacter"
import { useWorldScope } from "./useWorldScope"

// Where you land: what you were last in, your characters and campaigns, and what you changed last
// in your library. A part with nothing in it is left out; with nothing at all there is a welcome.
export function HomePage() {
  const userId = useAuth().session!.user.id
  const { campaigns, loading, error } = useCampaign()
  const { cards, error: charactersError } = useCharacterCards()
  const { entries, error: entriesError } = useWorldEntries(useWorldScope())
  const newCharacter = useNewCharacter()
  const [joining, setJoining] = useState(false)
  const { gate } = useAccountDialog()
  const join = () => gate("join a campaign", () => setJoining(true))

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
  const empty = campaigns.length === 0 && characters.length === 0 && (entries ?? []).length === 0

  return (
    <div className="mx-auto w-full max-w-[1400px] px-2 py-4 md:px-6">
      {failure && <FormAlert tone="error">{failure}</FormAlert>}
      {empty ? (
        <HomeWelcome onCreate={newCharacter.open} onJoin={join} />
      ) : (
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="flex min-w-0 flex-col gap-10 lg:col-span-2">
            {resume && <HomeContinue campaign={resume} />}
            <HomeCreate entries={entries} onNewCharacter={newCharacter.open} />
            <HomeCharacters cards={characters} onCreate={newCharacter.open} />
          </div>
          {/* The panel is laid over this column, so the list scrolls inside it instead of
              making the page taller than the left side. */}
          <div className="relative min-w-0">
            <HomeRecent />
          </div>
        </div>
      )}
      {newCharacter.dialog}
      <JoinCampaignDialog open={joining} onOpenChange={setJoining} />
    </div>
  )
}
