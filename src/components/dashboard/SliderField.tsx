import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type Props = {
  label: string
  value: number
  min: number
  max: number
  step: number
  // The number is shown as the value times this, so 0 to 1 can read as a percent.
  scale?: number
  unit: string
  onChange: (value: number) => void
}

const round = (value: number) => String(Math.round(value * 10) / 10)

// A slider with its number beside it, which can be typed over. Typing only
// counts once it is finished, and a number past the ends is brought back to them.
export function SliderField({ label, value, min, max, step, scale = 1, unit, onChange }: Props) {
  const shown = round(value * scale)
  const [draft, setDraft] = useState(shown)
  useEffect(() => setDraft(shown), [shown])

  function finish() {
    const typed = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(typed)) return setDraft(shown)
    onChange(Math.min(Math.max(typed / scale, min), max))
    setDraft(shown)
  }

  return (
    <div className="grid gap-2">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      <div className="flex items-center gap-3">
        <Slider
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([next]) => onChange(next)}
        />
        <div className="relative shrink-0">
          <Input
            inputMode="decimal"
            aria-label={`${label} value`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={finish}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") setDraft(shown)
            }}
            className="h-7 w-16 pr-6 text-right text-xs tabular-nums"
          />
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px]">
            {unit}
          </span>
        </div>
      </div>
    </div>
  )
}
