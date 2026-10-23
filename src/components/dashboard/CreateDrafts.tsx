import { Skeleton } from "@/components/ui/skeleton"
import type { Draft } from "@/lib/drafts"
import { CreateCard } from "./CreateCard"
import { DraftRow } from "./DraftRow"

// Unfinished work from every tool, newest first.
export function CreateDrafts({ drafts }: { drafts: Draft[] | null }) {
  return (
    <CreateCard title="Drafts">
      {!drafts ? (
        <Skeleton className="mx-2 my-1 h-12" />
      ) : drafts.length === 0 ? (
        <p className="text-muted-foreground px-2 py-2 text-sm">No drafts.</p>
      ) : (
        drafts.map((draft) => <DraftRow key={draft.id} draft={draft} />)
      )}
    </CreateCard>
  )
}
