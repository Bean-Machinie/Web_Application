import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HealthInput } from "./HealthInput"

const STEPS = [-5, -1, 1, 5]

type Props = {
  current: number | undefined
  max: number | undefined
  onCurrent: (value: number | undefined) => void
  onMax: (value: number | undefined) => void
}

// The GM's quick controls, shown in a popover on the Health tile.
export function HealthControls({ current, max, onCurrent, onMax }: Props) {
  const hasMax = current !== undefined && max !== undefined

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-1.5">
        {STEPS.map((step) => (
          <Button
            key={step}
            variant="outline"
            size="sm"
            className="tabular-nums"
            disabled={!hasMax}
            onClick={() => onCurrent(current! + step)}
          >
            {step > 0 ? `+${step}` : `−${-step}`}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">
            Current
          </span>
          <HealthInput label="Current health" value={current} disabled={!hasMax} onChange={onCurrent} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">
            Max
          </span>
          <HealthInput label="Maximum health" value={max} placeholder="Max" onChange={onMax} />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground justify-start"
        disabled={!hasMax || current === max}
        onClick={() => onCurrent(undefined)}
      >
        <RotateCcw />
        Reset to full
      </Button>
    </div>
  )
}
