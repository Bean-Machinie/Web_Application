import type { Formula } from "./character-templates/formulas"
import { readStat, readTrack } from "./character-values"
import type { SheetField } from "./character-sheet"
import type { StoredValue } from "./characters"

// A derived value is a number, or null when something it needs is missing.
export type Derived = Record<string, number | null>

const MAX_DEPTH = 8

// Works out every derived field from the stored values. Nothing is stored: this runs
// whenever the values change. A formula that refers to itself, or nests too deep, is null.
export function deriveAll(fields: SheetField[], values: Record<string, StoredValue>): Derived {
  const byId = new Map(fields.map((field) => [field.id, field]))
  const done: Derived = {}

  function valueOf(id: string, depth: number): number | null {
    const target = byId.get(id)
    if (!target) return null
    if (!target.derived) return readStat(values[id]?.value)
    if (id in done) return done[id]
    done[id] = null // while it is being worked out, so a loop ends here
    done[id] = run(target.derived, depth + 1)
    return done[id]
  }

  function run(formula: Formula, depth: number): number | null {
    if (depth > MAX_DEPTH) return null
    switch (formula.op) {
      case "number":
        return formula.value
      case "field":
        return valueOf(formula.id, depth)
      case "add": {
        const terms = formula.terms.map((term) => run(term, depth + 1))
        return terms.some((term) => term === null) ? null : (terms as number[]).reduce((sum, term) => sum + term, 0)
      }
      case "floor": {
        const x = run(formula.of, depth + 1)
        return x === null ? null : Math.floor((x + formula.plus) / formula.divide)
      }
      case "when": {
        const on = values[formula.field]?.value === true
        const chosen = on ? formula.then : formula.otherwise
        return chosen ? run(chosen, depth + 1) : null
      }
      case "countStarted":
        return formula.fields.filter((id) => {
          const target = byId.get(id)
          return target && readTrack(values[id]?.value, target.config.length ?? Infinity) > 0
        }).length
    }
  }

  for (const field of fields) if (field.derived) valueOf(field.id, 0)
  return done
}

// How a number reads: "+2" and "-1" when signed, and "—" when missing.
export function formatNumber(value: number | null | undefined, signed: boolean) {
  if (value === null || value === undefined) return "—"
  return signed && value >= 0 ? `+${value}` : String(value)
}
