import { User } from "lucide-react"
import { CollectionEmptyState } from "@/components/dashboard/CollectionEmptyState"
import { CollectionPage } from "@/components/dashboard/CollectionPage"

export function Characters() {
  return (
    <CollectionPage tabs={null} actions={null}>
      <CollectionEmptyState
        icon={User}
        title="No characters yet"
        description="Player characters and NPCs will show up here."
      />
    </CollectionPage>
  )
}
