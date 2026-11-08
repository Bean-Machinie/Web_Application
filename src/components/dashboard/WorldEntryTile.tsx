import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { BentoTile } from "./BentoTile"
import { CreateEntries } from "./CreateEntries"
import { HomeCardBody } from "./HomeCardBody"
import { useWorldScope } from "./useWorldScope"

// The wide World entry tile; the kind of entry is chosen in a window, as the Workshop shows the kinds.
export function WorldEntryTile() {
  const scope = useWorldScope()
  const createEntry = useCreateEntry(scope)
  const [choosing, setChoosing] = useState(false)

  return (
    <BentoTile className="md:col-span-2">
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
