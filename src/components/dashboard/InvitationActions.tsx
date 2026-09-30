import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/campaigns"
import { useCampaign } from "./useCampaign"

// Accept and Decline for a pending invitation. Reading the notification does
// not answer it; these buttons stay until the invitation is answered.
export function InvitationActions({ invitationId }: { invitationId: string }) {
  const { respond } = useCampaign()
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function answer(accept: boolean) {
    setBusy(accept ? "accept" : "decline")
    setError(null)
    try {
      await respond(invitationId, accept)
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => answer(false)}
        >
          {busy === "decline" && <Loader2 className="size-4 animate-spin" />}
          Decline
        </Button>
        <Button size="sm" disabled={busy !== null} onClick={() => answer(true)}>
          {busy === "accept" && <Loader2 className="size-4 animate-spin" />}
          Accept
        </Button>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
