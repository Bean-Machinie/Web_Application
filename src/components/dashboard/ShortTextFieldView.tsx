import type { FieldViewProps } from "./field-types"

export function ShortTextFieldView({ value }: FieldViewProps) {
  return <span className="text-sm">{typeof value === "string" ? value : ""}</span>
}
