import { BookOpen } from "lucide-react"
import { CollectionEmptyState } from "./CollectionEmptyState"

export function JournalEmpty({ canManage, hasPages }: { canManage: boolean; hasPages: boolean }) {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col justify-center">
      <CollectionEmptyState
        icon={BookOpen}
        title={hasPages ? "Pick a page" : "No pages yet"}
        description={
          hasPages
            ? "Choose a page in the list to read it."
            : canManage
              ? "Add the first page with the plus above the list."
              : "Pages your game master shares will show up here."
        }
      />
    </div>
  )
}
