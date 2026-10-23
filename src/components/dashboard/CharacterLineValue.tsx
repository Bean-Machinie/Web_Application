import { readLine } from "@/lib/character-values"
import { InlineText } from "./InlineText"

// One line of text, typed over when clicked.
export function CharacterLineValue({ value, label, onChange }: { value: unknown; label: string; onChange: (value: string) => void }) {
  return <InlineText value={readLine(value)} placeholder={label} allowEmpty maxLength={120} onSave={onChange} />
}
