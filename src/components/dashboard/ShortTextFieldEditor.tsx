import { Input } from "@/components/ui/input"
import type { FieldEditorProps } from "./field-types"

export function ShortTextFieldEditor({ value, label, placeholder, onChange }: FieldEditorProps) {
  return (
    <Input
      aria-label={label}
      autoComplete="off"
      maxLength={80}
      placeholder={placeholder}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
    />
  )
}
