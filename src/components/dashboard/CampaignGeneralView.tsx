import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { CampaignAvatar } from "./CampaignAvatar"
import { SettingsSection } from "./SettingsSection"

// What players see: the same rows as the form, read-only.
export function CampaignGeneralView({ campaign }: { campaign: Campaign }) {
  return (
    <div className="divide-y">
      <div className="py-6">
        <CampaignAvatar
          name={campaign.name}
          imageUrl={campaign.imageUrl}
          className="ring-border size-32 shadow-sm ring-1"
        />
      </div>
      <SettingsSection title="Campaign name" description="Set by the GM.">
        <p className="text-sm">{campaign.name}</p>
      </SettingsSection>
      <SettingsSection title="Description" description="About the campaign.">
        <p className="text-sm whitespace-pre-wrap">
          {campaign.description || (
            <span className="text-muted-foreground">No description yet.</span>
          )}
        </p>
      </SettingsSection>
      <SettingsSection title="Status" description="Where the campaign stands.">
        <Badge variant="secondary">{STATUS_LABELS[campaign.status]}</Badge>
      </SettingsSection>
    </div>
  )
}
