import { SquaresSubtract, SquaresUnite } from "lucide-react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LandMode } from "@/lib/map-builder-tools"

type Props = {
  cutting: boolean
  onMode: (mode: LandMode) => void
}

// Both options say the same thing when it is hovered: the key that switches between them.
const withKey = (item: React.ReactElement) => (
  <Tooltip>
    <TooltipTrigger asChild>{item}</TooltipTrigger>
    <TooltipContent side="right" keys={["Alt"]}>
      Tap to switch
    </TooltipContent>
  </Tooltip>
)

// Whether the Land tool adds or cuts, for all its sub tools: a segmented control, whose
// thumb slides from one to the other, whether it is clicked or Alt is tapped.
export function MapLandModeToggle({ cutting, onMode }: Props) {
  return (
    <SegmentedControl<LandMode>
      aria-label="Mode"
      value={cutting ? "cut" : "add"}
      onValueChange={onMode}
      options={[
        { value: "add", label: "Add", icon: <SquaresUnite />, wrap: withKey },
        { value: "cut", label: "Cut", icon: <SquaresSubtract />, wrap: withKey },
      ]}
    />
  )
}
