import { useState } from "react"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import { cancelInvitation } from "@/lib/invitations"
import type { SentInvitation } from "@/lib/invitations"
import { FormAlert } from "@/components/auth/FormAlert"

type Props = {
  invitations: SentInvitation[]
  onCancelled: () => void
}

export function SentInvitations({ invitations, onCancelled }: Props) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function cancel(id: string) {
    setCancellingId(id)
    setError(null)
    try {
      await cancelInvitation(id)
      onCancelled()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setCancellingId(null)
    }
  }

  if (invitations.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium">Pending invitations</h4>
      <ul className="divide-y rounded-lg border">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="flex items-center gap-3 px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {invitation.inviteeName || invitation.inviteeUsername || "Unnamed"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {invitation.inviteeUsername && `@${invitation.inviteeUsername} · `}
                Invited {new Date(invitation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              disabled={cancellingId === invitation.id}
              onClick={() => cancel(invitation.id)}
            >
              Cancel
            </Button>
          </li>
        ))}
      </ul>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
