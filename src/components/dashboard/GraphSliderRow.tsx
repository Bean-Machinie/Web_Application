import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type Props = {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

// One setting: its name and value over a slider. It changes the graph as it moves.
export function GraphSliderRow({ id, label, value, min, max, step, onChange }: Props) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-normal">
          {label}
        </Label>
        <span className="text-muted-foreground text-xs tabular-nums">{Number(value.toFixed(3))}</span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
