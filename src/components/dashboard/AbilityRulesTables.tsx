import { signed } from "@/lib/character-format"
import { MODIFIER_ROWS, SCORE_MEANINGS } from "@/lib/character-templates/srd-5-2-1-ability-rules"
import { POINT_BUY_COSTS } from "@/lib/character-templates/srd-5-2-1"

// The small tables of the rules panel: rows of a muted range and a value, in two columns when short.
function Rows({ rows, columns = 1 }: { rows: [string, string][]; columns?: 1 | 2 }) {
  const spread = columns === 2
  return (
    <dl className={`grid gap-x-6 text-sm ${columns === 2 ? "grid-cols-2" : ""}`}>
      {rows.map(([key, value]) => (
        <div key={key} className={`border-border/60 flex items-baseline gap-4 border-b py-1.5 last:border-b-0 ${spread ? "justify-between" : ""}`}>
          <dt className={`text-muted-foreground tabular-nums ${spread ? "" : "w-12 shrink-0"}`}>{key}</dt>
          <dd className={`tabular-nums ${spread ? "font-medium" : ""}`}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export const ScoreMeaningTable = () => <Rows rows={SCORE_MEANINGS} />

export const ModifierTable = () => <Rows columns={2} rows={MODIFIER_ROWS.map(([range, modifier]) => [range, signed(modifier)])} />

export const PointCostTable = () => <Rows columns={2} rows={Object.entries(POINT_BUY_COSTS).map(([score, cost]) => [score, `${cost}`])} />
