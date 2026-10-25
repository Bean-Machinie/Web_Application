// A value worked out from other fields, written as data so a template can declare it and
// nothing is ever evaluated as code. It is computed whenever it is read and never stored.
// A missing number makes the result missing ("—"); an unmarked toggle takes the
// `otherwise` branch.
export type Formula =
  | { op: "field"; id: string }
  | { op: "number"; value: number }
  | { op: "add"; terms: Formula[] }
  // floor((x + plus) / divide): the ability modifier is floor((score - 10) / 2).
  | { op: "floor"; of: Formula; plus: number; divide: number }
  // `field` is a toggle.
  | { op: "when"; field: string; then: Formula; otherwise?: Formula }
  // How many of these tracks have at least one box marked.
  | { op: "countStarted"; fields: string[] }
  // `by` is a choice field: the number the table has for the option chosen. Null when
  // nothing is chosen or the table has no entry, unless `otherwise` says what to use.
  | { op: "lookup"; by: string; table: Record<string, number>; otherwise?: number }
  // `by` is a choice field: the value of the field its option names.
  | { op: "pick"; by: string; fields: Record<string, string> }
  | { op: "min" | "max" | "multiply"; terms: Formula[] }

export const field = (id: string): Formula => ({ op: "field", id })
export const number = (value: number): Formula => ({ op: "number", value })
export const add = (...terms: Formula[]): Formula => ({ op: "add", terms })
export const floor = (of: Formula, plus: number, divide: number): Formula => ({ op: "floor", of, plus, divide })
export const when = (toggle: string, then: Formula, otherwise?: Formula): Formula => ({
  op: "when",
  field: toggle,
  then,
  otherwise,
})
export const countStarted = (fields: string[]): Formula => ({ op: "countStarted", fields })
export const lookup = (by: string, table: Record<string, number>, otherwise?: number): Formula => ({
  op: "lookup",
  by,
  table,
  otherwise,
})
export const pick = (by: string, fields: Record<string, string>): Formula => ({ op: "pick", by, fields })
export const min = (...terms: Formula[]): Formula => ({ op: "min", terms })
export const max = (...terms: Formula[]): Formula => ({ op: "max", terms })
export const multiply = (...terms: Formula[]): Formula => ({ op: "multiply", terms })
