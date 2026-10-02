import type { FieldViewProps } from "./field-types"

export function SelectFieldView({ value, options = [] }: FieldViewProps) {
  const chosen = options.find((option) => option.value === value)
  return <span className="text-sm">{chosen?.label ?? ""}</span>
}
