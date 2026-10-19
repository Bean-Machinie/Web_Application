import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"

type Props = { mode: WorldViewMode; onChange: (mode: WorldViewMode) => void }

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
      <ToggleGroupItem value="list" aria-label="List view">
        <List />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
