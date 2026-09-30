import { useCampaign } from "@/components/dashboard/useCampaign"
import { WorldEntryList } from "@/components/dashboard/WorldEntryList"

export function World() {
  const { current } = useCampaign()

  // Only rendered inside RequireCampaign, so there is always a campaign.
  if (!current) return null

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <div className="pb-6">
        <h2 className="text-xl font-semibold tracking-tight">World</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          NPCs, places and lore for {current.name}.
        </p>
      </div>
      <WorldEntryList key={current.id} campaign={current} />
    </div>
  )
}
