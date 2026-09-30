import { InvitationItem } from "@/components/dashboard/InvitationItem"
import { useCampaign } from "@/components/dashboard/useCampaign"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function SettingsNotifications() {
  const { invitations } = useCampaign()

  return (
    <div className="pt-6">
      {invitations.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>
              Invitations to join a campaign will show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y rounded-lg border">
          {invitations.map((invitation) => (
            <InvitationItem key={invitation.id} invitation={invitation} />
          ))}
        </ul>
      )}
    </div>
  )
}
