import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { addMonsterToCampaign } from "@/lib/add-monster"
import { campaignPath } from "@/lib/campaign-paths"
import { can } from "@/lib/campaign-permissions"
import { errorMessage } from "@/lib/campaigns"
import type { Campaign } from "@/lib/campaigns"
import type { Monster } from "@/lib/compendium-monsters"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { CampaignPickList } from "./CampaignPickList"
import { useCampaign } from "./useCampaign"
import { useRouteCampaign } from "./useCurrentCampaign"

type Props = { monsters: Monster[]; open: boolean; onClose: () => void }

const KINDS = ["creature", "npc"] as const

// Which campaign (skipped inside one, which is the obvious choice), then whether the monster
// becomes a Creature or an NPC. Only campaigns whose world the person manages are offered.
export function AddMonsterDialog({ monsters, open, onClose }: Props) {
  const navigate = useNavigate()
  const { campaigns } = useCampaign()
  const inside = useRouteCampaign()
  const [picked, setPicked] = useState<Campaign | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const manageable = campaigns.filter((campaign) => can(campaign.role, "manage_world"))
  const campaign = picked ?? (inside && can(inside.role, "manage_world") ? inside : null)

  const what = monsters.length === 1 ? monsters[0].name : `${monsters.length} creatures`

  async function add(kind: (typeof KINDS)[number]) {
    if (!campaign) return
    setBusy(true)
    setError(null)
    try {
      // One at a time, so the world keeps the order they were picked in.
      const entries = []
      for (const monster of monsters) entries.push(await addMonsterToCampaign(campaign.id, monster, kind))
      toast.success(`Added ${what} to ${campaign.name}.`)
      navigate(campaignPath(campaign.id, entries.length === 1 ? `world/${entries[0].id}` : "world"))
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add to campaign</DialogTitle>
          <DialogDescription>
            {campaign
              ? `${what} ${monsters.length === 1 ? "becomes a hidden entry" : "become hidden entries"} in ${campaign.name}, each with its own copy of the stat block.`
              : `${what} will be copied into the world of the campaign you pick. ${monsters.length === 1 ? "It starts" : "They start"} hidden, each with its own copy of the stat block.`}
          </DialogDescription>
        </DialogHeader>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {campaign ? (
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((kind) => {
              const { label, icon: Icon, description } = WORLD_KINDS[kind]
              return (
                <Button key={kind} variant="outline" disabled={busy} onClick={() => add(kind)} className="h-auto flex-col gap-1 py-3">
                  <Icon className="size-5" />
                  {label}
                  <span className="text-muted-foreground text-xs font-normal">{description}</span>
                </Button>
              )
            })}
          </div>
        ) : (
          <CampaignPickList campaigns={manageable} busy={busy} onPick={setPicked} />
        )}
      </DialogContent>
    </Dialog>
  )
}
