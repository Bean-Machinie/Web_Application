import { optionsFor } from "./character-choices"
import type { Formula } from "./character-templates/formulas"
import { readStat, readTrack } from "./character-values"
import type { SheetField } from "./character-sheet"
import type { StoredValue } from "./characters"

// A derived value is a number, or null when something it needs is missing. A toggle is 1
// or 0, and a choice is the number of its option, counting from 1.
export type Derived = Record<string, number | null>

// Loops end at the field being worked out; this only stops a formula nested absurdly deep.
const MAX_DEPTH = 64

// What the player entered over a calculated value, as a number; undefined when nothing.
function enteredNumber(field: SheetField, raw: unknown) {
  if (field.type === "toggle") return typeof raw === "boolean" ? Number(raw) : undefined
  return field.type === "stat" ? (readStat(raw) ?? undefined) : undefined
}

// Whether the player's own value is standing in for the calculated one.
export function isEdited(field: SheetField, values: Record<string, StoredValue>) {
  const raw = values[field.id]?.value
  return field.derived !== undefined && (field.type === "choice" ? typeof raw === "string" : enteredNumber(field, raw) !== undefined)
}

// Works out every derived field, and every choice, from the stored values. Nothing is
// stored: this runs whenever the values change. A value the player entered over a derived
// field is used in its place, and formulas that read the field get that one. A formula that
// refers to itself, or nests too deep, is null.
export function deriveAll(fields: SheetField[], values: Record<string, StoredValue>): Derived {
  const byId = new Map(fields.map((field) => [field.id, field]))
  const done: Derived = {}

  function chosenOf(id: string, depth: number): string | null {
    const field = byId.get(id)
    if (!field) return null
    const number = valueOf(id, depth + 1)
    return number ? (optionsFor(field, (by) => chosenOf(by, depth + 1))[number - 1]?.id ?? null) : null
  }

  function choiceNumber(field: SheetField, depth: number) {
    const options = optionsFor(field, (by) => chosenOf(by, depth + 1))
    const stored = options.findIndex((option) => option.id === values[field.id]?.value)
    if (stored >= 0) return stored + 1
    const calculated = field.derived ? run(field.derived, depth + 1) : null
    return calculated !== null && calculated >= 1 && calculated <= options.length ? calculated : null
  }

  function valueOf(id: string, depth: number): number | null {
    const target = byId.get(id)
    if (!target || depth > MAX_DEPTH) return null
    if (!target.derived && target.type !== "choice") {
      return target.type === "toggle" ? Number(values[id]?.value === true) : readStat(values[id]?.value)
    }
    if (id in done) return done[id]
    done[id] = null // while it is being worked out, so a loop ends here
    done[id] =
      target.type === "choice"
        ? choiceNumber(target, depth)
        : (enteredNumber(target, values[id]?.value) ?? run(target.derived!, depth + 1))
    return done[id]
  }

  function all(terms: Formula[], depth: number) {
    const numbers = terms.map((term) => run(term, depth + 1))
    return numbers.some((number) => number === null) ? null : (numbers as number[])
  }

  function run(formula: Formula, depth: number): number | null {
    if (depth > MAX_DEPTH) return null
    switch (formula.op) {
      case "number":
        return formula.value
      case "field":
        return valueOf(formula.id, depth)
      case "add":
        return all(formula.terms, depth)?.reduce((sum, term) => sum + term, 0) ?? null
      case "multiply":
        return all(formula.terms, depth)?.reduce((product, term) => product * term, 1) ?? null
      case "min": {
        const numbers = all(formula.terms, depth)
        return numbers && Math.min(...numbers)
      }
      case "max": {
        const numbers = all(formula.terms, depth)
        return numbers && Math.max(...numbers)
      }
      case "floor": {
        const x = run(formula.of, depth + 1)
        return x === null ? null : Math.floor((x + formula.plus) / formula.divide)
      }
      case "when": {
        const chosen = (valueOf(formula.field, depth + 1) ?? 0) > 0 ? formula.then : formula.otherwise
        return chosen ? run(chosen, depth + 1) : null
      }
      case "countStarted":
        return formula.fields.filter((id) => {
          const target = byId.get(id)
          return target && readTrack(values[id]?.value, target.config.length ?? Infinity) > 0
        }).length
      case "lookup": {
        const option = chosenOf(formula.by, depth + 1)
        return (option ? formula.table[option] : undefined) ?? formula.otherwise ?? null
      }
      case "picked": {
        const list = values[formula.field]?.value
        return Array.isArray(list) && list.includes(formula.id) ? 1 : 0
      }
      case "option": {
        const chosen = chosenOf(formula.by, depth + 1)
        const target = byId.get(formula.of)
        const id = chosen ? formula.table[chosen] : undefined
        if (!target || !id) return null
        const at = optionsFor(target, (by) => chosenOf(by, depth + 1)).findIndex((candidate) => candidate.id === id)
        return at >= 0 ? at + 1 : null
      }
      case "pick": {
        const option = chosenOf(formula.by, depth + 1)
        const target = option ? formula.fields[option] : undefined
        return target ? valueOf(target, depth + 1) : (formula.otherwise ?? null)
      }
    }
  }

  for (const field of fields) if (field.derived || field.type === "choice") valueOf(field.id, 0)
  return done
}

// How a number reads: "+2" and "-1" when signed, "d10" for a die, and "—" when missing.
export function formatNumber(value: number | null | undefined, format?: SheetField["format"]) {
  if (value === null || value === undefined) return "—"
  if (format === "die") return `d${value}`
  if (format === "feet") return value === 0 ? "None" : `${value} ft`
  if (format === "pounds") return `${value} lb`
  return format === "signed" && value >= 0 ? `+${value}` : String(value)
}
