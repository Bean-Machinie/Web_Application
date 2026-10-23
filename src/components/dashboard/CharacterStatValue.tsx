import { readStat, toWhole } from "@/lib/character-values"
import { InlineText } from "./InlineText"

// A number, read as text and typed over when clicked.
export function CharacterStatValue({ value, onChange }: { value: unknown; onChange: (value: number | null) => void }) {
  return (
    <InlineText
      value={readStat(value)?.toString() ?? ""}
      placeholder="Empty"
      inputMode="numeric"
      allowEmpty
      maxLength={7}
      onSave={(text) => onChange(toWhole(text))}
      className="tabular-nums"
    />
  )
}
