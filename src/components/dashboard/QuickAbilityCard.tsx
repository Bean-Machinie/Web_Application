import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { POINT_BUY_MIN } from "@/lib/character-templates/srd-5-2-1"
import { buyScore, raiseCost } from "@/lib/quick-abilities"
import { totalWith } from "./ability-facts"
import { QuickSwap } from "./QuickSwap"

type Props = {
  label: string
  method: AbilityMethod
  // The base score, before the background's increase.
  base: number | null
  bonus: number
  // The numbers the ability can be given, for the Standard Array and Roll: the ones not held yet.
  options: number[]
  // Point buy only: the points still to spend.
  left: number
  onScore: (score: number | null) => void
}

const modifier = (total: number) => Math.floor((total - 10) / 2)
const signed = (value: number) => (value >= 0 ? `+${value}` : `−${-value}`)

// One ability, as large as the Overview's tile: the modifier, the score it comes to, and what
// sets it: a list of the numbers still to hand out, or buttons that spend points.
export function QuickAbilityCard({ label, method, base: stored, bonus, options, left, onScore }: Props) {
  const score = buyScore(stored)
  // Point buy starts every score at its lowest, as the points left count it.
  const base = method === "point-buy" ? score : stored
  const total = base === null ? null : totalWith(base, bonus)
  const next = raiseCost(score)
  const values = base !== null && !options.includes(base) ? [base, ...options] : options

  return (
    <li className="bg-muted/40 flex flex-col items-center gap-3 rounded-xl border p-5">
      <h3 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">{label}</h3>
      <div className="text-4xl font-semibold tabular-nums">
        <QuickSwap text={total === null ? "—" : signed(modifier(total))} className="px-0" />
      </div>
      <p className="text-muted-foreground text-sm tabular-nums">
        <QuickSwap text={total === null ? "No score" : bonus > 0 ? `${total} (${base} + ${bonus})` : `${total}`} className="px-0" />
      </p>
      {method === "point-buy" ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label={`Lower ${label}`} disabled={score <= POINT_BUY_MIN} onClick={() => onScore(score - 1)}>
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{score}</span>
          <Button variant="outline" size="icon-sm" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => onScore(score + 1)}>
            <Plus />
          </Button>
        </div>
      ) : (
        <Select value={base === null ? "" : String(base)} onValueChange={(value) => onScore(value === "none" ? null : Number(value))}>
          <SelectTrigger size="sm" aria-label={`${label} score`} className="w-28">
            <SelectValue placeholder="Assign" />
          </SelectTrigger>
          <SelectContent>
            {base !== null && <SelectItem value="none">Clear</SelectItem>}
            {values.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </li>
  )
}
