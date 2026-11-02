import { ChevronsDown, ChevronsUp } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { D20Mode } from "@/lib/dice"
import { DiceModifier } from "./DiceModifier"

const MODES = [
  { value: "advantage", label: "Advantage", icon: ChevronsUp, hint: "Roll two d20s, keep the higher. Only applies to d20s." },
  { value: "disadvantage", label: "Disadvantage", icon: ChevronsDown, hint: "Roll two d20s, keep the lower. Only applies to d20s." },
] as const

type Props = { modifier: number; onModifier: (value: number) => void; mode: D20Mode; onMode: (mode: D20Mode) => void }

// The modifier on the left; on the right two switches, each on or off. Both off is a normal roll, and
// the one that is on is filled, so it reads at once. It is marked by aria-checked, as the
// segmented control is: the tooltip around it takes data-state for its own. It wraps onto two lines if the panel is too narrow.
export function DiceOptions({ modifier, onModifier, mode, onMode }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <DiceModifier value={modifier} onChange={onModifier} />
      <ToggleGroup
        type="single"
        spacing={1}
        aria-label="d20 roll mode"
        value={mode === "normal" ? "" : mode}
        onValueChange={(next) => onMode((next || "normal") as D20Mode)}
      >
        {MODES.map(({ value, label, icon: Icon, hint }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={value}
                size="sm"
                className="text-muted-foreground bg-muted/40 hover:bg-muted aria-checked:bg-primary aria-checked:text-primary-foreground aria-checked:hover:bg-primary/90 aria-checked:border-primary h-8 gap-1 rounded-lg border px-2 text-xs"
              >
                <Icon />
                {label}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">{hint}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  )
}
