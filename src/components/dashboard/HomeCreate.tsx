import { useMemo, useState } from "react"
import { Box, Map as MapIcon, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { CHARACTER_CREATOR_IMAGE, ENTRY_KIND_IMAGES, mapToolImage } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { CardFanEffect } from "./CardFanEffect"
import { CreateEntries } from "./CreateEntries"
import { DiceEffect } from "./DiceEffect"
import { HomeToolTile } from "./HomeToolTile"
import { MapRouteEffect } from "./MapRouteEffect"
import { NewMapDialog } from "./NewMapDialog"
import { SectionLabel } from "./SectionLabel"
import { useWorldScope } from "./useWorldScope"

type Props = { entries: WorldEntry[] | null; onNewCharacter: () => void }

// The three ways to make something, as a row of squares. The world entry's kind is chosen in a
// window, as the Workshop showed the kinds.
export function HomeCreate({ entries, onNewCharacter }: Props) {
  const scope = useWorldScope()
  const createEntry = useCreateEntry(scope)
  const [makingMap, setMakingMap] = useState(false)
  const [choosing, setChoosing] = useState(false)
  const image = useMemo(() => mapToolImage(entries), [entries])

  return (
    <section>
      <SectionLabel>Create</SectionLabel>
      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
        <HomeToolTile name="Map Maker" description="Paint world and region maps" icon={MapIcon} image={image} onOpen={() => setMakingMap(true)} effect={({ active }) => <MapRouteEffect active={active} />} />
        <HomeToolTile name="Character Creator" description="Build a character in minutes" icon={User} image={CHARACTER_CREATOR_IMAGE} onOpen={onNewCharacter} effect={(state) => <DiceEffect {...state} />} />
        <HomeToolTile name="World entry" description="People, places and things" icon={Box} image={ENTRY_KIND_IMAGES.location ?? null} onOpen={() => setChoosing(true)} effect={({ active }) => <CardFanEffect active={active} />} />
      </div>
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
      <NewMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
    </section>
  )
}
