import { useCallback, useEffect, useState } from "react"
import { Trash2, UserPlus } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import { LoadingGate } from "@/components/LoadingGate"
import { Button } from "@/components/ui/button"
import { canDeleteCampaign } from "@/lib/campaign-permissions"
import { fetchMembers, removeMember } from "@/lib/campaign-members"
import type { Member } from "@/lib/campaign-members"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { fetchSentInvitations } from "@/lib/invitations"
import type { SentInvitation } from "@/lib/invitations"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "./ConfirmDialog"
import { InviteDialog } from "./InviteDialog"
import { MembersTable } from "./MembersTable"
import { MembersTableSkeleton } from "./MembersTableSkeleton"
import { SentInvitations } from "./SentInvitations"
import { useCampaign } from "./useCampaign"

// The last list seen per campaign, so coming back shows it at once and
// refreshes quietly instead of starting from a skeleton.
const seenMembers = new Map<string, Member[]>()

// Render with key={campaign.id} so switching campaigns starts from scratch.
export function CampaignMembers({ campaign }: { campaign: Campaign }) {
  const userId = useAuth().session!.user.id
  const { can } = useCampaign()
  const [members, setMembers] = useState<Member[] | null>(
    () => seenMembers.get(campaign.id) ?? null
  )
  const [sent, setSent] = useState<SentInvitation[] | null>(null)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canInvite = can("invite")
  const isCreator = canDeleteCampaign(campaign, userId)

  const loadMembers = useCallback(
    () =>
      fetchMembers(campaign.id)
        .then((list) => {
          seenMembers.set(campaign.id, list)
          setMembers(list)
        })
        .catch((failure) => setError(errorMessage(failure))),
    [campaign.id]
  )

  const loadSent = useCallback(
    () =>
      canInvite
        ? fetchSentInvitations(campaign.id)
            .then(setSent)
            .catch(() => setSent([]))
        : Promise.resolve(),
    [campaign.id, canInvite]
  )

  useEffect(() => {
    loadMembers()
    loadSent()
  }, [loadMembers, loadSent])

  // The database enforces the same rules: nobody removes the owner or
  // themselves, and only the owner removes a GM.
  function actionsFor(member: Member) {
    const removable =
      member.userId !== userId &&
      !member.isCreator &&
      (member.role !== "gm" || isCreator)

    return removable
      ? [
          {
            label: "Remove from campaign",
            icon: Trash2,
            destructive: true,
            onSelect: () => setRemoving(member),
          },
        ]
      : []
  }

  async function handleRemove() {
    setBusy(true)
    setError(null)
    try {
      await removeMember(campaign.id, removing!.userId)
      setRemoving(null)
      await loadMembers()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="bg-card overflow-hidden rounded-xl border shadow-xs">
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Members</h3>
              {members && <Badge variant="secondary">{members.length}</Badge>}
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Everyone with access to this campaign.
            </p>
          </div>
          {canInvite && (
            <Button onClick={() => setInviting(true)}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          )}
        </div>

        {error && !removing && (
          <div className="border-t px-6 py-4">
            <FormAlert tone="error">{error}</FormAlert>
          </div>
        )}
        <LoadingGate
          loading={!members && !error}
          className="border-t"
          skeleton={<MembersTableSkeleton withActions={can("remove_members")} />}
        >
          {() =>
            members && (
              <MembersTable
                members={members}
                userId={userId}
                actionsFor={can("remove_members") ? actionsFor : null}
              />
            )
          }
        </LoadingGate>
      </div>

      {canInvite && <SentInvitations invitations={sent} onCancelled={loadSent} />}

      {canInvite && (
        <InviteDialog
          campaignId={campaign.id}
          open={inviting}
          onClose={() => setInviting(false)}
          onInvited={loadSent}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.username || "this person"}?`}
        description="They lose access to the campaign straight away and are told they were removed. They can rejoin with a new invitation or the invite link."
        confirmLabel="Remove from campaign"
        busy={busy}
        error={error}
        onCancel={() => {
          setRemoving(null)
          setError(null)
        }}
        onConfirm={handleRemove}
      />
    </div>
  )
}
