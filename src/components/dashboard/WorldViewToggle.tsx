import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"

type Props = { mode: WorldViewMode; onChange: (mode: WorldViewMode) => void }

// The tooltip around each item sets its own data-state ("closed"), which replaces
// the toggle's "on", so the chosen view is marked by what the group sets on it
// instead: aria-checked. It is the same fill the campaigns switch uses.
const CHOSEN = "aria-checked:bg-muted"

export function WorldViewToggle({ mode, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={mode}
      // Pressing the chosen view again would clear the group; keep it chosen.
      onValueChange={(next) => next && onChange(next as WorldViewMode)}
      aria-label="View"
      spacing={0}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="list" aria-label="List view" className={CHOSEN}>
            <List />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="grid" aria-label="Grid view" className={CHOSEN}>
            <LayoutGrid />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Grid view</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
