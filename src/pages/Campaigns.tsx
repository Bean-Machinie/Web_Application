import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignEmpty } from "@/components/dashboard/CampaignEmpty"
import { CampaignGrid } from "@/components/dashboard/CampaignGrid"
import { CampaignTable } from "@/components/dashboard/CampaignTable"
import { CampaignToolbar } from "@/components/dashboard/CampaignToolbar"
import { JoinCampaignDialog } from "@/components/dashboard/JoinCampaignDialog"
import { LeaveCampaignDialog } from "@/components/dashboard/LeaveCampaignDialog"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useCampaignViewMode } from "@/hooks/use-campaign-view-mode"
import { defaultSort, viewCampaigns } from "@/lib/campaign-list"
import type { RoleFilter, Sort } from "@/lib/campaign-list"
import type { Campaign } from "@/lib/campaigns"

// Every campaign you belong to, and where the app always opens.
export function Campaigns() {
  const { campaigns, loading, error } = useCampaign()
  const members = useCampaignMembers(campaigns)
  const [mode, setMode] = useCampaignViewMode()
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<RoleFilter>("all")
  const [sort, setSort] = useState<Sort>(defaultSort("name"))
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState<Campaign | null>(null)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  const shown = viewCampaigns(campaigns, { query, role, sort })

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h2 className="text-3xl font-semibold tracking-tight">Campaigns</h2>

      {error && <FormAlert tone="error">{error}</FormAlert>}

      {campaigns.length === 0 ? (
        <CampaignEmpty onJoin={() => setJoining(true)} />
      ) : (
        <>
          <CampaignToolbar
            query={query}
            onQuery={setQuery}
            role={role}
            onRole={setRole}
            sort={sort}
            onSort={setSort}
            mode={mode}
            onMode={setMode}
            onJoin={() => setJoining(true)}
          />
          {shown.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No campaigns match.
            </p>
          ) : mode === "grid" ? (
            <CampaignGrid campaigns={shown} members={members} onLeave={setLeaving} />
          ) : (
            <CampaignTable
              campaigns={shown}
              members={members}
              sort={sort}
              onSort={setSort}
              onLeave={setLeaving}
            />
          )}
        </>
      )}

      <JoinCampaignDialog open={joining} onOpenChange={setJoining} />
      <LeaveCampaignDialog campaign={leaving} onClose={() => setLeaving(null)} />
    </div>
  )
}
