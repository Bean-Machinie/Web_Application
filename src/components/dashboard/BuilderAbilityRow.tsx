import { Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { formatNumber } from "@/lib/character-derive"
import { POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_MIN } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { toWhole } from "@/lib/character-values"
import { LEVELS } from "./builder-increase"
import type { Level } from "./builder-increase"
import { BuilderLabel } from "./BuilderLabel"
import type { SheetActions } from "./character-actions"

type Props = {
  id: AbilityId
  label: string
  actions: SheetActions
  primary: boolean
  // The score stored, or null while none is.
  stored: number | null
  score: number
  left: number
  typing: boolean
  // The background’s increase for this ability; null when it is not one of its three.
  level: Level | null
  onScore: (score: number) => void
  onTyped: (score: number) => void
  onLevel: (level: Level) => void
}

const CELL = "px-3 py-2 align-middle"

// One ability as a row of the scores table: the base score to change, what it costs, the
// background’s increase, and the total and modifier as the sheet will show them.
export function BuilderAbilityRow({ id, label, actions, primary, stored, score, left, typing, level, onScore, onTyped, onLevel }: Props) {
  const next = score < POINT_BUY_MAX ? POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score] : null
  const total = actions.derived[`${id}.total`] ?? null
  return (
    <tr className="h-14 border-t">
      <th scope="row" className={`${CELL} pl-6 text-left text-sm font-normal`}>
        <span className="flex items-center gap-2">
          <BuilderLabel glossaryKey={`ability.${id}`} actions={actions}>{label}</BuilderLabel>
          {primary && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">Primary</Badge>}
        </span>
      </th>
      <td className={CELL}>
        {typing ? (
          <Input
            aria-label={label}
            inputMode="numeric"
            maxLength={2}
            defaultValue={stored?.toString() ?? ""}
            onBlur={(event) => {
              const typed = toWhole(event.target.value)
              if (typed !== null) onTyped(Math.min(Math.max(typed, 1), 20))
            }}
            className="h-8 w-20 text-center tabular-nums"
          />
        ) : (
          <span className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" aria-label={`Lower ${label}`} disabled={score <= POINT_BUY_MIN} onClick={() => onScore(score - 1)}>
              <Minus />
            </Button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums">{score}</span>
            <Button variant="outline" size="icon" className="size-8" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => onScore(score + 1)}>
              <Plus />
            </Button>
          </span>
        )}
      </td>
      <td className={`${CELL} text-muted-foreground text-sm tabular-nums`}>{typing ? "—" : POINT_BUY_COSTS[score]}</td>
      <td className={CELL}>
        {level && <SegmentedControl value={level} onValueChange={onLevel} options={LEVELS} aria-label={`${label} increase`} className="w-36" />}
      </td>
      <td className={`${CELL} text-sm font-medium tabular-nums`}>{stored === null ? "—" : (total ?? "—")}</td>
      <td className={`${CELL} pr-6 text-2xl font-semibold tabular-nums`}>{stored === null ? "—" : formatNumber(actions.derived[`${id}.mod`], "signed")}</td>
    </tr>
  )
}
