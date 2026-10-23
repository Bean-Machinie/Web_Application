import { readStat, toWhole } from "@/lib/character-values"
import { InlineText } from "./InlineText"

type Props = { value: unknown; label: string; onChange: (value: number | null) => void; className?: string }

// A number, read as text and typed over when clicked. Empty, it is a muted dash.
export function CharacterStatValue({ value, label, onChange, className }: Props) {
  return (
    <InlineText
      value={readStat(value)?.toString() ?? ""}
      placeholder="—"
      label={label}
      inputMode="numeric"
      allowEmpty
      maxLength={7}
      onSave={(text) => onChange(toWhole(text))}
      className={className ?? "tabular-nums"}
    />
  )
}
