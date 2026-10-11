import { SquaresSubtract, SquaresUnite } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LandMode } from "@/lib/map-builder-tools"

const MODES = [
  { mode: "add", label: "Add", Icon: SquaresUnite },
  { mode: "cut", label: "Cut", Icon: SquaresSubtract },
] as const

type Props = {
  cutting: boolean
  onMode: (mode: LandMode) => void
}

// Whether the Land tool adds or cuts, for both its sub tools: two buttons side by side.
export function MapLandModeToggle({ cutting, onMode }: Props) {
  return (
    <div role="group" aria-label="Mode" className="bg-muted grid grid-cols-2 gap-0.5 rounded-lg p-0.5">
      {MODES.map(({ mode, label, Icon }) => {
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
            <TooltipContent side="right" keys={["Alt"]}>
              Tap to switch
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
