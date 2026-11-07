import { useMemo, useState } from "react"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { mapToolImage } from "@/lib/tool-images"
import { CreateEntries } from "./CreateEntries"
import { CreateTools } from "./CreateTools"
import { NewMapDialog } from "./NewMapDialog"
import { useNewCharacter } from "./useNewCharacter"
import { useWorldScope } from "./useWorldScope"
import { WorkshopRecent } from "./WorkshopRecent"

// Where things are made. What is made ends up in the library, which is the scope the
// route gives it. Two columns in up to 1360px: the tools and the new
// entries on the left, the recent list on the right at the height of the left.
export function WorkshopPage() {
  const scope = useWorldScope()
  const { entries } = useWorldEntries(scope)
  const createEntry = useCreateEntry(scope)
  const newCharacter = useNewCharacter()
  const [makingMap, setMakingMap] = useState(false)

  const toolImage = useMemo(() => mapToolImage(entries), [entries])

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-12 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-16">
          <CreateTools image={toolImage} onNewMap={() => setMakingMap(true)} onNewCharacter={newCharacter.open} />
          <CreateEntries kinds={scope.kinds.filter((kind) => kind !== "map")} onPick={createEntry} />
        </div>
        <WorkshopRecent />
      </div>
      <NewMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
      {newCharacter.dialog}
    </>
  )
}
