import { CalendarDays } from "lucide-react"
import { CollectionEmptyState } from "@/components/dashboard/CollectionEmptyState"
import { CollectionPage } from "@/components/dashboard/CollectionPage"

// The toolbar has no controls until there are sessions to search, filter or view.
export function Sessions() {
  return (
    <CollectionPage tabs={null} actions={null}>
      <CollectionEmptyState
        icon={CalendarDays}
        title="No sessions yet"
        description="Sessions you plan, and the notes you keep on them, will show up here."
      />
    </CollectionPage>
  )
}
