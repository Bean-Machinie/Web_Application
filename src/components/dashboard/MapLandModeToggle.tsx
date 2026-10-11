import { SquaresSubtract, SquaresUnite } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LandMode } from "@/lib/map-builder-tools"

const MODES = [
  { mode: "add", label: "Add", hint: "What is drawn becomes land. Overlapping shapes merge.", Icon: SquaresUnite },
  { mode: "cut", label: "Cut", hint: "What is drawn is cut away from the land: bays, lakes, straits.", Icon: SquaresSubtract },
] as const

type Props = {
  cutting: boolean
  onMode: (mode: LandMode) => void
}

// Whether the Land tool adds or cuts, for both its sub tools: two buttons side by side.
export function MapLandModeToggle({ cutting, onMode }: Props) {
  return (
    <div role="group" aria-label="Mode" className="bg-muted grid grid-cols-2 gap-0.5 rounded-lg p-0.5">
      {MODES.map(({ mode, label, hint, Icon }) => {
        const active = (mode === "cut") === cutting
        return (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={active ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={active}
                className={active ? "shadow-sm" : "text-muted-foreground"}
                onClick={() => onMode(mode)}
              >
                <Icon /> {label}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{hint}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
