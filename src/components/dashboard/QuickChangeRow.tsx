import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuickPropertyRow } from "./QuickPropertyRow"

type Props = {
  icon: LucideIcon
  name: string
  value: string
  changed: boolean
  open: boolean
  onToggle: () => void
  // One line on what it is, shown when the row is open.
  text: string
  // Opens the panel that changes it; none, and there is no button.
  onChange: (() => void) | null
}

// A row of the property list whose open state is a line of text and a Change button.
export function QuickChangeRow({ text, onChange, ...row }: Props) {
  return (
    <li>
      <QuickPropertyRow {...row}>
        <p className="text-muted-foreground text-[13px] leading-snug">{text}</p>
        {onChange && <Button variant="secondary" size="sm" onClick={onChange}>Change</Button>}
      </QuickPropertyRow>
    </li>
  )
}
