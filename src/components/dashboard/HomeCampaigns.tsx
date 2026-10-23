import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignEmpty } from "@/components/dashboard/CampaignEmpty"
import { CampaignGrid } from "@/components/dashboard/CampaignGrid"
import { CampaignTable } from "@/components/dashboard/CampaignTable"
import { CampaignToolbar } from "@/components/dashboard/CampaignToolbar"
import { JoinCampaignDialog } from "@/components/dashboard/JoinCampaignDialog"
import { LeaveCampaignDialog } from "@/components/dashboard/LeaveCampaignDialog"
import { SectionHeading } from "@/components/dashboard/SectionHeading"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { useCampaignMembers } from "@/hooks/use-campaign-members"
import { useCampaignListPrefs } from "@/hooks/use-campaign-list-prefs"
import { useCampaignViewMode } from "@/hooks/use-campaign-view-mode"
import { viewCampaigns } from "@/lib/campaign-list"
import type { Campaign } from "@/lib/campaigns"

// The main column of Home: the heading, the toolbar (with Join and New campaign at its
// right end), and every campaign you belong to as cards or a table.
export function HomeCampaigns() {
  const { campaigns, loading, error } = useCampaign()
  const members = useCampaignMembers(campaigns)
  const [mode, setMode] = useCampaignViewMode()
  const [query, setQuery] = useState("")
  const { role, setRole, sort, setSort } = useCampaignListPrefs()
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
    <div className="flex w-full flex-col gap-4">
      <SectionHeading>Campaigns</SectionHeading>

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
