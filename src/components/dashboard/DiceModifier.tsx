import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signed } from "@/lib/character-format"

const LIMIT = 99
const clamp = (value: number) => Math.min(LIMIT, Math.max(-LIMIT, value))

type Props = { value: number; onChange: (value: number) => void }

// One soft pill with the number between its two buttons; the number can be typed over.
export function DiceModifier({ value, onChange }: Props) {
  // What is being typed, while the field has focus.
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    const typed = parseInt(draft ?? "", 10)
    if (!Number.isNaN(typed)) onChange(clamp(typed))
    setDraft(null)
  }

  return (
    <div className="bg-muted/40 flex h-8 items-center rounded-lg border p-0.5">
      <Button variant="ghost" size="icon-sm" className="text-muted-foreground size-7 rounded-md" aria-label="Lower the modifier" disabled={value <= -LIMIT} onClick={() => onChange(clamp(value - 1))}>
        <Minus />
      </Button>
      <input
        aria-label="Modifier"
        inputMode="numeric"
        value={draft ?? (value === 0 ? "0" : signed(value))}
        onFocus={(event) => {
          const field = event.currentTarget
          setDraft(String(value))
          setTimeout(() => field.select())
        }}
        onChange={(event) => setDraft(event.target.value.replace(/[^\d+-]/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className="focus:bg-background h-7 w-11 rounded-md bg-transparent text-center text-sm font-medium tabular-nums outline-none"
      />
      <Button variant="ghost" size="icon-sm" className="text-muted-foreground size-7 rounded-md" aria-label="Raise the modifier" disabled={value >= LIMIT} onClick={() => onChange(clamp(value + 1))}>
        <Plus />
      </Button>
    </div>
  )
}
