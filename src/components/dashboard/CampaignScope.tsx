import { useEffect, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { can as roleCan } from "@/lib/campaign-permissions"
import type { CampaignPermission } from "@/lib/campaign-permissions"
import { CampaignNotFound } from "./CampaignNotFound"
import { CampaignScopeContext } from "./CampaignScopeContext"
import { useCampaign } from "./useCampaign"

// Takes the campaign from the address. Pages below it can rely on there being one.
export function CampaignScope() {
  const { campaignId = "" } = useParams()
  const { campaigns, loading, refresh } = useCampaign()
  // A campaign that was just made or joined is not in the list yet, so the
  // list is fetched once more for an id before that id is called unknown.
  const [refetchedFor, setRefetchedFor] = useState<string | null>(null)
  const current = campaigns.find((campaign) => campaign.id === campaignId)
  const unknown = !loading && !current
  const refetching = unknown && refetchedFor !== campaignId

  useEffect(() => {
    if (refetching) refresh().finally(() => setRefetchedFor(campaignId))
  }, [refetching, campaignId, refresh])

  if (loading || refetching) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (!current) return <CampaignNotFound />

  const can = (permission: CampaignPermission) => roleCan(current.role, permission)

  return (
    <CampaignScopeContext.Provider value={{ current, can }}>
      <Outlet />
    </CampaignScopeContext.Provider>
  )
}
