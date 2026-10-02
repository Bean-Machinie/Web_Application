import { useCampaign } from "@/components/dashboard/useCampaign"
import { WorldEntryList } from "@/components/dashboard/WorldEntryList"

export function World() {
  const { current } = useCampaign()

  // Only rendered inside RequireCampaign, so there is always a campaign.
  if (!current) return null

  return (
    <div className="mx-auto flex -mb-4 h-[calc(100svh-4rem)] w-full max-w-5xl flex-col md:-mb-6 md:h-[calc(100svh-4.5rem)]">
      <WorldEntryList key={current.id} campaign={current} />
    </div>
  )
}
