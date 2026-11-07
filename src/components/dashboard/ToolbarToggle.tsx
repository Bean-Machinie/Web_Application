import type { ReactNode } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props<T extends string> = {
  value: T
  onChange: (value: T) => void
  label: string
  options: { value: T; label: string; content: ReactNode }[]
}

// The tooltip around each item sets its own data-state ("closed"), which replaces the toggle's
// "on", so the chosen one is marked by what the group sets on it instead: aria-checked.
const CHOSEN = "aria-checked:bg-muted"

// The one segmented control of the toolbars: card size, and list, grid or graph.
export function ToolbarToggle<T extends string>({ value, onChange, label, options }: Props<T>) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      // Pressing the chosen one again would clear the group; keep it chosen.
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
      spacing={0}
    >
      {options.map((option) => (
        <Tooltip key={option.value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={option.value} aria-label={option.label} className={CHOSEN}>
              {option.content}
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{option.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
