import { formatNumber } from "@/lib/character-derive"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { BuilderLabel } from "./BuilderLabel"
import type { SheetActions } from "./character-actions"

// The result: each ability as the sheet will show it, the modifier large and the score under
// it with where it comes from ("17 · 15 + 2").
export function BuilderScoreTiles({ actions }: { actions: SheetActions }) {
  return (
    <section aria-label="Result" className="bg-card rounded-lg border p-6 shadow-xs">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Your ability scores</h2>
        <span className="text-muted-foreground text-xs">
          The big number is the <BuilderLabel glossaryKey="modifier" fieldId="str.mod" actions={actions}>modifier</BuilderLabel>, the one you add to rolls
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map(([id, label]) => {
          const base = readStat(actions.values[id]?.value)
          const total = actions.derived[`${id}.total`] ?? null
          return (
            <div key={id} className="bg-muted/40 flex flex-col items-center gap-0.5 rounded-lg border px-2 py-3">
              <span className="text-muted-foreground text-[11px] tracking-wide uppercase">{label}</span>
              <span className="text-2xl font-semibold tabular-nums">{base === null ? "—" : formatNumber(actions.derived[`${id}.mod`], "signed")}</span>
              <span className="text-sm tabular-nums">
                {total ?? "—"}
                {base !== null && total !== null && total !== base && <span className="text-muted-foreground text-xs"> · {base} + {total - base}</span>}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
