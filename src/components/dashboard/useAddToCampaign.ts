import { useState } from "react"
import { useCopyChoice } from "@/hooks/use-copy-choice"
import { useNoticeTimeout } from "@/hooks/use-notice-timeout"
import { campaignPath } from "@/lib/campaign-paths"
import { can } from "@/lib/campaign-permissions"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import { copyEntries, copyNote } from "@/lib/world-copy-flow"
import type { WorldEntry } from "@/lib/world-entries"
import { useCampaign } from "./useCampaign"

export type AddNotice = { text: string; to: string; linkLabel: string }

// Adding library entries to a campaign: the picker of campaigns, then the copy, which
// asks its own questions (a duplicate, linked entries) through `copyDialog`. Only
// campaigns whose world the person manages are offered. When it is done `notice`
// says what was added and where to see it.
export function useAddToCampaign() {
  const { campaigns } = useCampaign()
  const [items, setItems] = useState<WorldEntry[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<AddNotice | null>(null)
  const { ask, dialog: copyDialog } = useCopyChoice()
  useNoticeTimeout(notice !== null, () => setNotice(null))

  async function add(campaign: Campaign) {
    if (!items || busy) return
    setBusy(true)
    setError(null)
    try {
      const picked = items.map(({ id, name, kind }) => ({ id, name, kind }))
      const outcome = await copyEntries(picked, { campaignId: campaign.id, folder: campaign.id }, ask)
      // Backing out of a question leaves the picker open, to choose again.
      if (outcome.cancelled) return
      if (outcome.error) {
        setError(`Nothing was added. ${outcome.error}`)
        return
      }
      const count = outcome.copiedIds.length
      const only = count === 1 ? outcome.newIds[outcome.copiedIds[0]] : undefined
      const name = items.find((item) => item.id === outcome.copiedIds[0])?.name
      const note = copyNote(outcome)
      setNotice({
        text: `Added ${only ? name : `${count} entries`} to ${campaign.name}.${note ? ` ${note}` : ""}`,
        to: campaignPath(campaign.id, only ? `world/${only}` : "world"),
        linkLabel: only ? "View entry" : "View in campaign",
      })
      setItems(null)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return {
    items,
    open: (entries: WorldEntry[]) => {
      setError(null)
      setNotice(null)
      setItems(entries)
    },
    close: () => setItems(null),
    campaigns: campaigns.filter((campaign) => can(campaign.role, "manage_world")),
    busy,
    error,
    add,
    notice,
    copyDialog,
  }
}

export type AddToCampaign = ReturnType<typeof useAddToCampaign>
