import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { ENTRY_KIND_IMAGES } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { BentoTile } from "./BentoTile"
import { CreateEntries } from "./CreateEntries"
import { HomeCardBody } from "./HomeCardBody"
import { ImageParticles } from "./ImageParticles"
import { useWorldScope } from "./useWorldScope"

// Pictures shown in turn, newest first.
const SHOWN = 12

// The pictures of the library's newest entries (not maps); the starter village's when it has none.
function picturesOf(entries: WorldEntry[] | null) {
  const newest = [...(entries ?? [])].filter((entry) => entry.kind !== "map" && entry.imageUrl).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  const pictures = newest.slice(0, SHOWN).map((entry) => entry.imageUrl!)
  return pictures.length > 0 ? pictures : [ENTRY_KIND_IMAGES.location, ENTRY_KIND_IMAGES.npc, ENTRY_KIND_IMAGES.item].filter((src) => src !== undefined)
}

// Any index but the current one, when there is another.
const another = (current: number, count: number) => (count < 2 ? 0 : (current + 1 + Math.floor(Math.random() * (count - 1))) % count)

// The World entry tile: an entry's picture in particles, a different one each time the tile is pointed
// at, and the way to make an entry, whose kind is chosen in a window, as the Workshop shows the kinds.
export function WorldEntryTile({ entries }: { entries: WorldEntry[] | null }) {
  const scope = useWorldScope()
  const createEntry = useCreateEntry(scope)
  const pictures = useMemo(() => picturesOf(entries), [entries])
  const [index, setIndex] = useState(0)
  const [choosing, setChoosing] = useState(false)

  return (
    <BentoTile area="world" onHot={(hot) => hot && setIndex((current) => another(current, pictures.length))} art={<ImageParticles src={pictures[index] ?? pictures[0]} className="absolute inset-0 size-full" />}>
      <HomeCardBody title="World entry" line="People, places and things" actions={<Button size="lg" onClick={() => setChoosing(true)}>New entry</Button>} />
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
