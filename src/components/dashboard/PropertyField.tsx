import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  label: string
  unit: string
  value: number
  // Called with a number the person typed, when they leave the field or press Enter.
  onCommit: (value: number) => void
}

// A small number field: it shows the value, lets it be typed over, and only
// changes the map when the typing is finished.
export function PropertyField({ label, unit, value, onCommit }: Props) {
  const shown = String(Math.round(value * 10) / 10)
  const [draft, setDraft] = useState(shown)
  useEffect(() => setDraft(shown), [shown])

  function finish() {
    const next = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(next) || next === value) setDraft(shown)
    else onCommit(next)
  }

  return (
    <div className="grid gap-1">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={finish}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
            if (event.key === "Escape") setDraft(shown)
          }}
          className="h-8 pr-7 text-[13px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs">
          {unit}
        </span>
      </div>
    </div>
  )
}
