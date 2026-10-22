import { LayoutDashboard } from "lucide-react"
import { CollectionEmptyState } from "@/components/dashboard/CollectionEmptyState"
import { CollectionPage } from "@/components/dashboard/CollectionPage"

export function Overview() {
  return (
    <CollectionPage tabs={null} actions={null}>
      <CollectionEmptyState
        icon={LayoutDashboard}
        title="No overview yet"
        description="A summary of your campaign will show up here."
      />
    </CollectionPage>
  )
}
