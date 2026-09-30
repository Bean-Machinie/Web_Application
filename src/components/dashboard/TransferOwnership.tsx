import { useEffect, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchMembers, transferOwnership } from "@/lib/campaign-members"
import type { Member } from "@/lib/campaign-members"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { ConfirmDialog } from "./ConfirmDialog"
import { useCampaign } from "./useCampaign"

// Render with key={campaign.id} so switching campaigns starts from scratch.
export function TransferOwnership({ campaign }: { campaign: Campaign }) {
  const userId = useAuth().session!.user.id
  const { refresh } = useCampaign()
  const [others, setOthers] = useState<Member[] | null>(null)
  const [selected, setSelected] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetchMembers(campaign.id)
      .then((list) => setOthers(list.filter((m) => m.userId !== userId)))
      .catch((failure) => setError(errorMessage(failure)))
  }, [campaign.id, userId])

  const target = others?.find((m) => m.userId === selected)
  const targetName = target?.username || "this person"

  async function handleTransfer() {
    setBusy(true)
    setError(null)
    try {
      await transferOwnership(campaign.id, selected)
      await refresh()
      setConfirming(false)
      setDone(true)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <FormAlert tone="success">{`${targetName} now owns this campaign.`}</FormAlert>
    )
  }

  if (others === null) {
    if (error) return <FormAlert tone="error">{error}</FormAlert>
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-[8.5rem]" />
      </div>
    )
  }

  if (others.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        There is nobody else in this campaign to hand it to yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger aria-label="New owner" className="w-full">
          <SelectValue placeholder="Choose a member" />
        </SelectTrigger>
        <SelectContent>
          {others.map((member) => (
            <SelectItem key={member.userId} value={member.userId}>
              {member.username || "Unnamed"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div>
        <Button
          variant="outline"
          disabled={!selected}
          onClick={() => setConfirming(true)}
        >
          Transfer ownership
        </Button>
      </div>
      {error && !confirming && <FormAlert tone="error">{error}</FormAlert>}
      <ConfirmDialog
        open={confirming}
        title={`Make ${targetName} the owner?`}
        description="They become a GM and the only person who can transfer or delete this campaign. You stay a GM and can leave the campaign. Both of you are notified."
        confirmLabel="Transfer ownership"
        busy={busy}
        error={error}
        onCancel={() => {
          setConfirming(false)
          setError(null)
        }}
        onConfirm={handleTransfer}
      />
    </div>
  )
}
