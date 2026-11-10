import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateEntry } from "@/hooks/use-create-entry"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { reelCards } from "@/lib/character-reel-cards"
import { BentoTile } from "./BentoTile"
import { CharacterReel } from "./CharacterReel"
import { CreateEntries } from "./CreateEntries"
import { HomeCardBody } from "./HomeCardBody"
import { useWorldScope } from "./useWorldScope"

// The World entry tile: your characters (and the starter village's people) as cards on a slanted reel,
// and the way to make an entry, whose kind is chosen in a window, as the Workshop shows the kinds.
export function WorldEntryTile({ cards }: { cards: CharacterCardData[] }) {
  const scope = useWorldScope()
  const createEntry = useCreateEntry(scope)
  const reel = useMemo(() => reelCards(cards), [cards])
  const [choosing, setChoosing] = useState(false)

  return (
    <BentoTile area="world" wide artAcross bottomShade art={<CharacterReel cards={reel} />}>
      <HomeCardBody title="World entry" line="People, places and things" actions={<Button onClick={() => setChoosing(true)}>New entry</Button>} />
      <Dialog open={choosing} onOpenChange={setChoosing}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="sr-only">New world entry</DialogTitle>
          </DialogHeader>
          <CreateEntries
            kinds={scope.kinds.filter((kind) => kind !== "map")}
            onPick={(kind) => {
              setChoosing(false)
              createEntry(kind)
            }}
          />
        </DialogContent>
      </Dialog>
    </BentoTile>
  )
}
