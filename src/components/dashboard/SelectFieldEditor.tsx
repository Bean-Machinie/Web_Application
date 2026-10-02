import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FieldEditorProps } from "./field-types"

// Radix reserves the empty string for "nothing chosen", so "Not set" gets a
// key of its own and maps back to null.
const NOT_SET = "__not_set"

export function SelectFieldEditor({ value, label, options = [], onChange }: FieldEditorProps) {
  return (
    <Select
      value={typeof value === "string" ? value : NOT_SET}
      onValueChange={(next) => onChange(next === NOT_SET ? null : next)}
    >
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NOT_SET} className="text-muted-foreground">
          Not set
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
