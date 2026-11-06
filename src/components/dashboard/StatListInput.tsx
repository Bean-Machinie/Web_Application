import { Input } from "@/components/ui/input"
import { StatField } from "./StatField"

type Props = { label: string; text: string; onCommit: (text: string) => void; className?: string }

// A comma-separated list in one box. It is read when the box is left, so a comma typed on the way
// is not taken for an empty item and removed.
export function StatListInput({ label, text, onCommit, className }: Props) {
  return (
    <StatField label={label} className={className}>
      <Input key={text} defaultValue={text} onBlur={(event) => event.target.value !== text && onCommit(event.target.value)} />
    </StatField>
  )
}
