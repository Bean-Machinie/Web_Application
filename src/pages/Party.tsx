import { Users } from "lucide-react"
import { CollectionEmptyState } from "@/components/dashboard/CollectionEmptyState"
import { CollectionPage } from "@/components/dashboard/CollectionPage"

export function Party() {
  return (
    <CollectionPage tabs={null} actions={null}>
      <CollectionEmptyState
        icon={Users}
        title="No party yet"
        description="The members who play in this campaign will show up here."
      />
    </CollectionPage>
  )
}
