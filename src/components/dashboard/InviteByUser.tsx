import { useCallback, useEffect, useState } from "react"
import { fetchSentInvitations } from "@/lib/invitations"
import type { SentInvitation } from "@/lib/invitations"
import { InviteUserSearch } from "./InviteUserSearch"
import { SentInvitations } from "./SentInvitations"

// Render with key={campaignId} so switching campaigns starts from scratch.
export function InviteByUser({ campaignId }: { campaignId: string }) {
  const [sent, setSent] = useState<SentInvitation[]>([])

  const reload = useCallback(
    () =>
      fetchSentInvitations(campaignId)
        .then(setSent)
        .catch(() => setSent([])),
    [campaignId]
  )

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <div className="flex flex-col gap-6">
      <InviteUserSearch campaignId={campaignId} onInvited={reload} />
      <SentInvitations invitations={sent} onCancelled={reload} />
    </div>
  )
}
