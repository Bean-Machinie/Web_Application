import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { ENTRY_KIND_IMAGES } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { BentoTile } from "./BentoTile"
import { CardFanEffect } from "./CardFanEffect"
import { CreateEntries } from "./CreateEntries"
import { HomeCardBody } from "./HomeCardBody"
import { useWorldScope } from "./useWorldScope"

const FANNED = ["npc", "location", "item"]

// The newest picture of each kind the fan shows, from the library.
function thumbsOf(entries: WorldEntry[] | null) {
  const thumbs: Partial<Record<string, string>> = {}
  const newest = [...(entries ?? [])].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  for (const entry of newest) if (FANNED.includes(entry.kind) && entry.imageUrl) thumbs[entry.kind] ??= entry.imageUrl
  return thumbs
}

// The wide World entry tile: a location's picture, where mini entry cards fan up on hover, and the way to
// make an entry, whose kind is chosen in a window, as the Workshop shows the kinds.
export function WorldEntryTile({ entries }: { entries: WorldEntry[] | null }) {
  const scope = useWorldScope()
  const createEntry = useCreateEntry(scope)
  const [choosing, setChoosing] = useState(false)
  const thumbs = useMemo(() => thumbsOf(entries), [entries])
  const art = (hot: boolean) => (
    <>
      <img src={ENTRY_KIND_IMAGES.location} alt="" className="absolute inset-0 size-full object-cover" />
      <CardFanEffect active={hot} thumbs={thumbs} />
    </>
  )

  return (
    <BentoTile wide art={art}>
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
