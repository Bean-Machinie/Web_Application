import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { KIND_TEXT, optionsOf } from "@/lib/quick-options"
import type { QuickKind } from "@/lib/quick-options"
import type { SheetActions } from "./character-actions"
import { QuickBackgroundDetails } from "./QuickBackgroundDetails"
import { QuickClassDetails } from "./QuickClassDetails"
import { QuickSpeciesDetails } from "./QuickSpeciesDetails"

type Props = {
  kind: QuickKind
  // The option shown; none keeps the sheet closed.
  id: string | null
  actions: SheetActions
  onClose: () => void
  // Only on the option pages, where the sheet can pick what it shows.
  onSelect?: (id: string) => void
}

// The full details of one option, in a sheet from the right.
export function QuickOptionSheet({ kind, id, actions, onClose, onSelect }: Props) {
  const option = optionsOf(kind).find((candidate) => candidate.id === id)
  const Details = { class: QuickClassDetails, species: QuickSpeciesDetails, background: QuickBackgroundDetails }[kind]

  return (
    <Sheet open={!!option} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetDescription>{KIND_TEXT[kind].noun}</SheetDescription>
          <SheetTitle className="text-2xl">{option?.name}</SheetTitle>
        </SheetHeader>
        {option && <Details id={option.id} actions={actions} />}
        {option && <p className="text-muted-foreground px-4 text-xs">{option.source}</p>}
        {option && onSelect && (
          <SheetFooter>
            <Button onClick={() => onSelect(option.id)}>Select {option.name}</Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
