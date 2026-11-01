import { useMemo, useState } from "react"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { MAP_BUILDER_IMAGE } from "@/lib/tool-images"
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

  // Until the builder has a picture of its own, the newest map that has one.
  const toolImage = useMemo(() => {
    if (MAP_BUILDER_IMAGE) return MAP_BUILDER_IMAGE
    const withImage = (entries ?? []).filter((entry) => entry.kind === "map" && entry.imageUrl)
    withImage.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    return withImage[0]?.imageUrl ?? null
  }, [entries])

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
