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
  // Called once a change is final: the slider let go, or a number typed. For
  // settings that are only previewed while the slider moves.
  onCommit?: (value: number) => void
  // The label, slider and number on one line, for wide panels; otherwise the
  // label sits above.
  inline?: boolean
}

const round = (value: number) => String(Math.round(value * 10) / 10)

// A slider with its number beside it, which can be typed over. Typing only
// counts once it is finished, and a number past the ends is brought back to them.
export function SliderField({ label, value, min, max, step, scale = 1, unit, onChange, onCommit, inline }: Props) {
  const shown = round(value * scale)
  const [draft, setDraft] = useState(shown)
  useEffect(() => setDraft(shown), [shown])

  function finish() {
    const typed = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(typed)) return setDraft(shown)
    // Brought to the nearest step, as the slider would, so a number typed is one it could be.
    const stepped = min + Math.round((typed / scale - min) / step) * step
    const next = Math.min(Math.max(Number(stepped.toFixed(4)), min), max)
    onChange(next)
    onCommit?.(next)
    setDraft(shown)
  }

  return (
    <div className={inline ? "flex items-center gap-3" : "grid gap-2"}>
      <Label className={`text-muted-foreground text-xs font-normal ${inline ? "w-20 shrink-0" : ""}`}>
        {label}
      </Label>
      <div className={`flex items-center gap-3 ${inline ? "min-w-0 flex-1" : ""}`}>
        <Slider
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([next]) => onChange(next)}
          onValueCommit={([next]) => onCommit?.(next)}
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
            className={`h-7 w-16 text-right text-xs tabular-nums ${unit ? "pr-6" : "pr-2"}`}
          />
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px]">
            {unit}
          </span>
        </div>
      </div>
    </div>
  )
}
