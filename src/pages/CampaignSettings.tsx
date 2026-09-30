import { InviteLinkSection } from "@/components/dashboard/InviteLinkSection"
import { SettingsSection } from "@/components/dashboard/SettingsSection"
import { useCampaign } from "@/components/dashboard/useCampaign"

export function CampaignSettings() {
  const { current, can } = useCampaign()

  // Only rendered inside RequireCampaign, so there is always a campaign.
  if (!current) return null

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="pb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Campaign settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Settings for {current.name}.
        </p>
      </div>
      <div className="border-t">
        <SettingsSection
          title="Invite link"
          description="Share this link so people can join as players. It does not expire."
        >
          {can("invite") ? (
            <InviteLinkSection key={current.id} campaignId={current.id} />
          ) : (
            <p className="text-muted-foreground text-sm">
              Only the GM can see or reset the invite link.
            </p>
          )}
        </SettingsSection>
      </div>
    </div>
  )
}
