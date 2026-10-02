import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FieldEditorProps } from "./field-types"
import { OptionDot } from "./OptionDot"

// Radix reserves the empty string for "nothing chosen", so "Not set" gets a
// key of its own and maps back to null.
const NOT_SET = "__not_set"

// Quiet until hovered, like a property in Notion or Linear; the list opens
// under the trigger instead of covering it.
export function SelectFieldEditor({ value, label, options = [], onChange }: FieldEditorProps) {
  const isSet = typeof value === "string"

  return (
    <Select
      value={isSet ? value : NOT_SET}
      onValueChange={(next) => onChange(next === NOT_SET ? null : next)}
    >
      <SelectTrigger
        aria-label={label}
        className={`hover:bg-muted data-[state=open]:bg-muted -ml-2.5 h-8 w-auto max-w-full border-transparent bg-transparent px-2.5 shadow-none dark:bg-transparent dark:hover:bg-muted ${
          isSet ? "" : "text-muted-foreground"
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="min-w-44">
        <SelectItem value={NOT_SET} className="text-muted-foreground">
          Not set
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <OptionDot tone={option.tone} />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
