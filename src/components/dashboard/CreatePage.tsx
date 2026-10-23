import { useMemo, useState } from "react"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { useDrafts } from "@/hooks/use-drafts"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { MAP_BUILDER_IMAGE } from "@/lib/tool-images"
import { CreateDrafts } from "./CreateDrafts"
import { CreateEntries } from "./CreateEntries"
import { CreateTools } from "./CreateTools"
import { NewMapDialog } from "./NewMapDialog"
import { useWorldScope } from "./useWorldScope"

// Where things are made. What is made ends up in the library, which is the scope the
// route gives it. It has the width of Home's campaigns.
export function CreatePage() {
  const scope = useWorldScope()
  const { entries } = useWorldEntries(scope)
  const drafts = useDrafts(scope, entries)
  const createEntry = useCreateEntry(scope)
  const [makingMap, setMakingMap] = useState(false)

  // Until the builder has a picture of its own, the newest map that has one.
  const toolImage = useMemo(() => {
    if (MAP_BUILDER_IMAGE) return MAP_BUILDER_IMAGE
    const withImage = (entries ?? []).filter((entry) => entry.kind === "map" && entry.imageUrl)
    withImage.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    return withImage[0]?.imageUrl ?? null
  }, [entries])

  return (
    <div className="mx-auto flex w-[1104px] max-w-full flex-col gap-10">
      <CreateTools image={toolImage} onNewMap={() => setMakingMap(true)} />
      <div className="grid gap-3 md:grid-cols-2">
        <CreateEntries kinds={scope.kinds.filter((kind) => kind !== "map")} onPick={createEntry} />
        <CreateDrafts drafts={drafts} />
      </div>
      <NewMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
    </div>
  )
}
