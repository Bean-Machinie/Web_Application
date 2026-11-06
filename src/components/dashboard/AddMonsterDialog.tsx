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
import { useCampaign } from "./useCampaign"
import { useRouteCampaign } from "./useCurrentCampaign"

type Props = { monster: Monster; open: boolean; onClose: () => void }

const KINDS = ["creature", "npc"] as const

// Which campaign (skipped inside one, which is the obvious choice), then whether the monster
// becomes a Creature or an NPC. Only campaigns whose world the person manages are offered.
export function AddMonsterDialog({ monster, open, onClose }: Props) {
  const navigate = useNavigate()
  const { campaigns } = useCampaign()
  const inside = useRouteCampaign()
  const [picked, setPicked] = useState<Campaign | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const manageable = campaigns.filter((campaign) => can(campaign.role, "manage_world"))
  const campaign = picked ?? (inside && can(inside.role, "manage_world") ? inside : null)

  async function add(kind: (typeof KINDS)[number]) {
    if (!campaign) return
    setBusy(true)
    setError(null)
    try {
      const entry = await addMonsterToCampaign(campaign.id, monster, kind)
      toast.success(`Added ${monster.name} to ${campaign.name}.`)
      navigate(campaignPath(campaign.id, `world/${entry.id}`))
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to campaign</DialogTitle>
          <DialogDescription>
            {campaign ? `${monster.name} becomes a hidden entry in ${campaign.name}, with its own copy of the stat block.` : `Pick the campaign to add ${monster.name} to.`}
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
        ) : manageable.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">You do not manage the world of any campaign yet.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {manageable.map((option) => (
              <li key={option.id}>
                <button type="button" onClick={() => setPicked(option)} className="hover:bg-accent focus-visible:ring-ring w-full truncate rounded-lg p-2 text-left font-medium outline-none focus-visible:ring-2">
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
