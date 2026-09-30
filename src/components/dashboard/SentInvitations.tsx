import { useState } from "react"
import { LoadingGate } from "@/components/LoadingGate"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { errorMessage } from "@/lib/campaigns"
import { cancelInvitation } from "@/lib/invitations"
import type { SentInvitation } from "@/lib/invitations"
import { FormAlert } from "@/components/auth/FormAlert"

type Props = {
  // Null while still loading.
  invitations: SentInvitation[] | null
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

  return (
    <LoadingGate
      loading={invitations === null}
      skeleton={
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Pending invitations</h4>
          <ul className="divide-y rounded-lg border">
            <li className="flex items-center gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-0 h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-14" />
            </li>
          </ul>
        </div>
      }
    >
      {() =>
        invitations && invitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Pending invitations</h4>
            <ul className="divide-y rounded-lg border">
              {invitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {invitation.inviteeUsername || "Unnamed"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      Invited{" "}
                      {new Date(invitation.createdAt).toLocaleDateString()}
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
        ) : null
      }
    </LoadingGate>
  )
}
