import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormAlert } from "@/components/auth/FormAlert"
import {
  errorMessage,
  fetchInviteCode,
  inviteUrl,
  resetInviteCode,
} from "@/lib/campaigns"
import { ResetInviteDialog } from "./ResetInviteDialog"

// Render with key={campaignId} so switching campaigns starts from scratch.
export function InviteLinkSection({ campaignId }: { campaignId: string }) {
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchInviteCode(campaignId)
      .then(setCode)
      .catch((failure) => setError(errorMessage(failure)))
  }, [campaignId])

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl(code!))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function reset() {
    setResetting(true)
    try {
      setCode(await resetInviteCode(campaignId))
      setConfirming(false)
    } catch (failure) {
      setError(errorMessage(failure))
      setConfirming(false)
    } finally {
      setResetting(false)
    }
  }

  if (error) return <FormAlert tone="error">{error}</FormAlert>
  if (!code) return <Loader2 className="text-muted-foreground size-4 animate-spin" />

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input readOnly aria-label="Invite link" value={inviteUrl(code)} />
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground -ml-2.5"
          onClick={() => setConfirming(true)}
        >
          Reset link
        </Button>
      </div>
      <ResetInviteDialog
        open={confirming}
        busy={resetting}
        onCancel={() => setConfirming(false)}
        onConfirm={reset}
      />
    </div>
  )
}
