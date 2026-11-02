import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signed } from "@/lib/character-format"

const LIMIT = 99

type Props = { value: number; onChange: (value: number) => void }

export function DiceModifier({ value, onChange }: Props) {
  const step = (by: number) => onChange(Math.min(LIMIT, Math.max(-LIMIT, value + by)))

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon-sm" aria-label="Lower the modifier" disabled={value <= -LIMIT} onClick={() => step(-1)}>
        <Minus />
      </Button>
      <span className="w-9 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {signed(value)}
      </span>
      <Button variant="outline" size="icon-sm" aria-label="Raise the modifier" disabled={value >= LIMIT} onClick={() => step(1)}>
        <Plus />
      </Button>
    </div>
  )
}
