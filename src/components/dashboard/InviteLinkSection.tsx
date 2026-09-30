import { useEffect, useState } from "react"
import { Check, Link2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  errorMessage,
  fetchInviteCode,
  inviteUrl,
  resetInviteCode,
} from "@/lib/campaigns"
import { ResetInviteDialog } from "./ResetInviteDialog"

// A compact copy row. The link is a read-only field, so a long link is simply
// clipped at the edge but can still be selected and copied in full.
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
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setResetting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-7 items-center justify-between">
        <h4 className="text-sm font-medium">Or share an invite link</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground -mr-2"
          disabled={!code}
          onClick={() => setConfirming(true)}
        >
          Reset link
        </Button>
      </div>
      {error ? (
        <FormAlert tone="error">{error}</FormAlert>
      ) : !code ? (
        <Skeleton className="h-10 w-full rounded-lg" />
      ) : (
        <div className="bg-muted/40 flex h-10 items-center gap-2 rounded-lg border pr-1 pl-3">
          <Link2 className="text-muted-foreground size-4 shrink-0" />
          <input
            readOnly
            aria-label="Invite link"
            value={inviteUrl(code)}
            onFocus={(event) => event.currentTarget.select()}
            className="text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            {copied && <Check className="size-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      )}
      <ResetInviteDialog
        open={confirming}
        busy={resetting}
        onCancel={() => setConfirming(false)}
        onConfirm={reset}
      />
    </div>
  )
}
