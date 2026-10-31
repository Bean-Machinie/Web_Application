import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POINT_BUY_MIN } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { buyScore, raiseCost } from "@/lib/quick-abilities"

type Props = {
  label: string
  method: AbilityMethod
  // The base score, before the background's increase.
  base: number | null
  // The numbers the ability can be given, for the Standard Array and Roll: the ones not held yet.
  options: number[]
  // Point buy only: the points still to spend.
  left: number
  onScore: (score: number | null) => void
}

// What sets an ability's score: a list of the numbers still to hand out, or for point buy a stepper
// that spends points, with the score between the buttons. Both are 32px high.
export function QuickAbilityControl({ label, method, base, options, left, onScore }: Props) {
  if (method === "point-buy") {
    const score = buyScore(base)
    const next = raiseCost(score)
    return (
      <div className="flex h-8 items-center gap-2">
        <Button variant="outline" size="icon-sm" aria-label={`Lower ${label}`} disabled={score <= POINT_BUY_MIN} onClick={() => onScore(score - 1)}>
          <Minus />
        </Button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">{score}</span>
        <Button variant="outline" size="icon-sm" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => onScore(score + 1)}>
          <Plus />
        </Button>
      </div>
    )
  }

  const values = base !== null && !options.includes(base) ? [base, ...options] : options
  return (
    <Select value={base === null ? "" : String(base)} onValueChange={(value) => onScore(value === "none" ? null : Number(value))}>
      <SelectTrigger size="sm" aria-label={`${label} score`} className="w-28">
        <SelectValue placeholder="Assign" />
      </SelectTrigger>
      <SelectContent>
        {base !== null && <SelectItem value="none">Clear</SelectItem>}
        {values.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
