import type { FieldViewProps } from "./field-types"
import { OptionDot } from "./OptionDot"

export function SelectFieldView({ value, options = [] }: FieldViewProps) {
  const chosen = options.find((option) => option.value === value)
  if (!chosen) return null

  return (
    <span className="flex items-center gap-2 text-sm">
      <OptionDot tone={chosen.tone} />
      {chosen.label}
    </span>
  )
}
