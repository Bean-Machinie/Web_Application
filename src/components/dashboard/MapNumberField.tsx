import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: number
  unit: string
  // Only a number that is allowed is passed on; anything else puts the old one back.
  onCommit: (value: number) => void
  accepts?: (value: number) => boolean
  className?: string
}

// A small number to type over, committed on Enter or on leaving it.
export function MapNumberField({ label, value, unit, onCommit, accepts = Number.isFinite, className }: Props) {
  const shown = String(value)
  const [draft, setDraft] = useState(shown)
  useEffect(() => setDraft(shown), [shown])

  function finish() {
    const typed = Number(draft)
    if (draft.trim() !== "" && accepts(typed)) onCommit(typed)
    setDraft(shown)
  }

  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        aria-label={label}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={finish}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") setDraft(shown)
        }}
        className={cn("h-6 pr-4 pl-1.5 text-right text-[11px] tabular-nums md:text-[11px]", className)}
      />
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-[10px]">
        {unit}
      </span>
    </div>
  )
}
