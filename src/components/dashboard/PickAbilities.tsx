import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { ABILITIES, POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_MIN, STANDARD_ARRAY_BY_CLASS } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat, toWhole } from "@/lib/character-values"
import { abilityFacts, totalWith } from "./ability-facts"
import { idFor, LEVELS, levelsFrom, withLevel } from "./pick-increase"
import type { Level } from "./pick-increase"
import { PickPointsBar } from "./PickPointsBar"
import type { SheetActions } from "./character-actions"

type Props = { draft: Record<string, unknown>; onDraft: (next: Record<string, unknown>) => void; actions: SheetActions }

const modifier = (total: number) => Math.floor((total - 10) / 2)
const signed = (value: number) => (value >= 0 ? `+${value}` : `−${-value}`)

// The ability scores as one table: the base by point buy, the background's increase beside it,
// and the total and modifier they come to. Changes are the draft until the panel is saved.
// Rolled scores can be typed instead, which skips the point limit.
export function PickAbilities({ draft, onDraft, actions }: Props) {
  const facts = abilityFacts(actions)
  const { background, cls } = facts
  const stored = (id: AbilityId) => readStat(draft[id])
  const [typing, setTyping] = useState(() => ABILITIES.some(([id]) => (stored(id) ?? POINT_BUY_MIN) > POINT_BUY_MAX || (stored(id) ?? POINT_BUY_MIN) < POINT_BUY_MIN))
  const [levels, setLevels] = useState(() => (background ? levelsFrom(background, (draft["ability-increase"] as string | null) ?? null) : {}))
  const score = (id: AbilityId) => Math.min(Math.max(stored(id) ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
  const left = 27 - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[score(id)], 0)
  const suggestion = cls ? STANDARD_ARRAY_BY_CLASS[cls.id] : null

  const setScores = (next: Partial<Record<AbilityId, number>>) => onDraft({ ...draft, ...next })
  const setLevel = (ability: AbilityId, level: Level) => {
    if (!background) return
    const next = withLevel(background, levels, ability, level)
    setLevels(next)
    onDraft({ ...draft, "ability-increase": idFor(background, next) })
  }
  const bonus = (id: AbilityId) => (levels[id] === "2" ? 2 : levels[id] === "1" ? 1 : 0)

  return (
    <div className="flex flex-col">
      <PickPointsBar typing={typing} left={left} className={cls?.label ?? null} onSuggest={suggestion ? () => setScores(suggestion) : null} background={background} levels={levels} />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground text-left text-xs">
            <th scope="col" className="py-2 font-normal">Ability</th>
            <th scope="col" className="py-2 font-normal">Base</th>
            <th scope="col" className="py-2 font-normal">{background ? background.label : "Increase"}</th>
            <th scope="col" className="py-2 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {ABILITIES.map(([id, label]) => {
            const base = stored(id)
            const total = base === null ? null : totalWith(base, bonus(id))
            const next = score(id) < POINT_BUY_MAX ? POINT_BUY_COSTS[score(id) + 1] - POINT_BUY_COSTS[score(id)] : null
            return (
              <tr key={id} className="h-12 border-t">
                <th scope="row" className="text-left font-normal">
                  <span className="flex items-center gap-1.5">
                    {label}
                    {facts.primary.has(id) && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">Primary</Badge>}
                  </span>
                </th>
                <td>
                  {typing ? (
                    <Input
                      aria-label={label}
                      inputMode="numeric"
                      maxLength={2}
                      defaultValue={base?.toString() ?? ""}
                      onBlur={(event) => {
                        const typed = toWhole(event.target.value)
                        if (typed !== null) setScores({ [id]: Math.min(Math.max(typed, 1), 20) })
                      }}
                      className="h-8 w-16 text-center tabular-nums"
                    />
                  ) : (
                    <span className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="size-7" aria-label={`Lower ${label}`} disabled={score(id) <= POINT_BUY_MIN} onClick={() => setScores({ [id]: score(id) - 1 })}>
                        <Minus />
                      </Button>
                      <span className="w-6 text-center font-semibold tabular-nums">{score(id)}</span>
                      <Button variant="outline" size="icon" className="size-7" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => setScores({ [id]: score(id) + 1 })}>
                        <Plus />
                      </Button>
                    </span>
                  )}
                </td>
                <td>
                  {background?.abilities.includes(id) && (
                    <SegmentedControl value={levels[id] ?? "0"} onValueChange={(level) => setLevel(id, level)} options={LEVELS} aria-label={`${label} increase`} className="w-28" />
                  )}
                </td>
                <td className="text-right tabular-nums">
                  {total === null ? "—" : <span className="font-medium">{total} <span className="text-muted-foreground text-xs">{signed(modifier(total))}</span></span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-muted-foreground border-t pt-3 text-xs">
        Rolled your scores at the table?{" "}
        <button type="button" onClick={() => setTyping(!typing)} className="text-foreground underline underline-offset-4">
          {typing ? "Back to point buy" : "Enter rolled scores instead"}
        </button>
      </p>
    </div>
  )
}
