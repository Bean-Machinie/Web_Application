import { readStat, toWhole } from "@/lib/character-values"
import { InlineText } from "./InlineText"

type Props = { value: unknown; onChange: (value: number | null) => void; className?: string }

// A number, read as text and typed over when clicked.
export function CharacterStatValue({ value, onChange, className }: Props) {
  return (
    <InlineText
      value={readStat(value)?.toString() ?? ""}
      placeholder="Empty"
      inputMode="numeric"
      allowEmpty
      maxLength={7}
      onSave={(text) => onChange(toWhole(text))}
      className={className ?? "tabular-nums"}
    />
  )
}
