import { LayoutGrid, List, Network } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"

const VIEWS = [
  { mode: "list", label: "List view", icon: List },
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
  { mode: "graph", label: "Graph view", icon: Network },
] as const

type Props = {
  mode: WorldViewMode
  onChange: (mode: WorldViewMode) => void
  // The views offered; the library has no list.
  modes?: readonly WorldViewMode[]
}

// The tooltip around each item sets its own data-state ("closed"), which replaces
// the toggle's "on", so the chosen view is marked by what the group sets on it
// instead: aria-checked. It is the same fill the campaigns switch uses.
const CHOSEN = "aria-checked:bg-muted"

export function WorldViewToggle({ mode, onChange, modes }: Props) {
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
      {VIEWS.filter((view) => !modes || modes.includes(view.mode)).map(
        ({ mode: value, label, icon: Icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={value} aria-label={label} className={CHOSEN}>
                <Icon />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      )}
    </ToggleGroup>
  )
}
