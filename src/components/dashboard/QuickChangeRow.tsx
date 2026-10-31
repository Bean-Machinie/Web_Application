import { Button } from "@/components/ui/button"
import { QuickAccordionRow } from "./QuickAccordionRow"

type Props = {
  // Names the row inside its Accordion.
  value: string
  name: string
  text: string
  changed: boolean
  // One line on what it is, shown when the row is open.
  about: string
  // Opens the panel that changes it; none, and there is no button.
  onChange: (() => void) | null
}

// An accordion row whose open state is a line of text and a Change button.
export function QuickChangeRow({ about, onChange, ...row }: Props) {
  return (
    <QuickAccordionRow {...row}>
      <p className="text-muted-foreground text-[13px] leading-snug">{about}</p>
      {onChange && <Button variant="secondary" size="sm" onClick={onChange}>Change</Button>}
    </QuickAccordionRow>
  )
}
