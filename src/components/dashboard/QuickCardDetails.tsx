import { QuickEditButton } from "./QuickEditButton"
import { QuickSectionHeader } from "./QuickSectionHeader"
import { QuickValue } from "./QuickValue"

type Props = {
  size: string
  sizeChanged: boolean
  concept: string
  alignment: string | null
  onDetails: (() => void) | null
  // Only for a species that lets the player choose its size.
  onSize: (() => void) | null
}

// A small row under the name: the size, the concept and the alignment, with a pencil for the
// details and, where size is a choice, one for the size.
export function QuickCardDetails({ size, sizeChanged, concept, alignment, onDetails, onSize }: Props) {
  const rest = [concept, alignment].filter(Boolean)
  return (
    <section aria-label="Details" className="flex flex-col">
      <QuickSectionHeader title="Details" onEdit={onDetails} />
      <p className="flex flex-wrap items-center gap-x-1 text-sm">
        <QuickValue value={size} changed={sizeChanged} className="-ml-1" />
        {onSize && <QuickEditButton label="Edit size" onClick={onSize} />}
        {rest.length > 0 && <span className="text-muted-foreground">· {rest.join(" · ")}</span>}
      </p>
    </section>
  )
}
