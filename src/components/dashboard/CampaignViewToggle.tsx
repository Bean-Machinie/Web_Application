import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CampaignViewMode } from "@/hooks/use-campaign-view-mode"

type Props = { mode: CampaignViewMode; onChange: (mode: CampaignViewMode) => void }

export function CampaignViewToggle({ mode, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={mode}
      // Pressing the chosen view again would clear the group; keep it chosen.
      onValueChange={(next) => next && onChange(next as CampaignViewMode)}
      aria-label="View"
      spacing={0}
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
