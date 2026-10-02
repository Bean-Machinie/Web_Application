import { Input } from "@/components/ui/input"
import type { FieldEditorProps } from "./field-types"

// A normal field, or with `quiet` plain text until hovered or focused.
export function ShortTextFieldEditor({ value, label, placeholder, quiet, onChange }: FieldEditorProps) {
  return (
    <Input
      aria-label={label}
      autoComplete="off"
      maxLength={80}
      placeholder={placeholder}
      className={
        quiet
          ? "hover:bg-muted focus-visible:bg-background -ml-2.5 h-8 border-transparent bg-transparent px-2.5 shadow-none dark:bg-transparent dark:hover:bg-muted"
          : undefined
      }
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
    />
  )
}
