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
  // Gives the player's own pick back to the suggestion; none when it is not one, or not different.
  onReset?: (() => void) | null
}

// An accordion row whose open state is a line of text and a Change button.
export function QuickChangeRow({ about, onChange, onReset, ...row }: Props) {
  return (
    <QuickAccordionRow {...row}>
      <p className="text-muted-foreground text-[13px] leading-snug">{about}</p>
      {onChange && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onChange}>Change</Button>
          {onReset && <Button variant="ghost" size="sm" onClick={onReset}>Use suggested</Button>}
        </div>
      )}
    </QuickAccordionRow>
  )
}
