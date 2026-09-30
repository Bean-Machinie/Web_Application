import { CampaignImageForm } from "@/components/dashboard/CampaignImageForm"
import { InviteByUser } from "@/components/dashboard/InviteByUser"
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
      <div className="divide-y border-t">
        {can("manage") && <CampaignImageForm key={current.id} campaign={current} />}
        {can("invite") && (
          <>
            <SettingsSection
              title="Invite a person"
              description="Search for an account by its exact email or username. They get the invitation under Notifications."
            >
              <InviteByUser key={current.id} campaignId={current.id} />
            </SettingsSection>
            <SettingsSection
              title="Invite link"
              description="Anyone with the link can ask to join as a player. It does not expire, but resetting it disables the old link."
            >
              <InviteLinkSection key={current.id} campaignId={current.id} />
            </SettingsSection>
          </>
        )}
        {!can("manage") && !can("invite") && (
          <p className="text-muted-foreground py-6 text-sm">
            Only the GM can change this campaign&apos;s settings.
          </p>
        )}
      </div>
    </div>
  )
}
