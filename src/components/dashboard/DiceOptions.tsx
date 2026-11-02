import { Info } from "lucide-react"
import type { ReactNode } from "react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { D20Mode } from "@/lib/dice"
import { DiceModifier } from "./DiceModifier"

const MODES: { value: D20Mode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "advantage", label: "Advantage" },
  { value: "disadvantage", label: "Disadvantage" },
]

function Row({ title, help, children }: { title: ReactNode; help?: string; children: ReactNode }) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-4 border-b py-2 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        {help && <p className="text-muted-foreground text-xs">{help}</p>}
      </div>
      {children}
    </div>
  )
}

type Props = { modifier: number; onModifier: (value: number) => void; mode: D20Mode; onMode: (mode: D20Mode) => void }

export function DiceOptions({ modifier, onModifier, mode, onMode }: Props) {
  return (
    <div className="grid">
      <Row title="Modifier">
        <DiceModifier value={modifier} onChange={onModifier} />
      </Row>
      <Row
        title={
          <span className="flex items-center gap-1.5">
            d20 rolls
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground size-3.5" aria-label="About advantage and disadvantage" />
              </TooltipTrigger>
              <TooltipContent className="max-w-60">
                Advantage: roll two d20s and keep the higher. Disadvantage: keep the lower. Only applies to d20s.
              </TooltipContent>
            </Tooltip>
          </span>
        }
      >
        <SegmentedControl aria-label="d20 roll mode" size="sm" value={mode} onValueChange={onMode} options={MODES} />
      </Row>
    </div>
  )
}
