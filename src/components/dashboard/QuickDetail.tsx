import { KIND_TEXT, optionsOf } from "@/lib/quick-options"
import type { QuickKind } from "@/lib/quick-options"
import type { SheetActions } from "./character-actions"
import { QUICK_DETAILS } from "./quick-details"

type Props = { kind: QuickKind; id: string | null; actions: SheetActions }

// Under the grid: the option being hovered, or the one chosen, in full, with the same hover
// cards as the sheet.
export function QuickDetail({ kind, id, actions }: Props) {
  const option = optionsOf(kind).find((candidate) => candidate.id === id)
  const Details = QUICK_DETAILS[kind]

  return (
    <section aria-live="polite" aria-label={`${KIND_TEXT[kind].noun} details`} className="bg-card rounded-xl border shadow-xs max-[999px]:hidden">
      {option ? (
        <>
          <header className="flex flex-col gap-0.5 px-4 pt-4 pb-3">
            <span className="text-muted-foreground text-xs">{KIND_TEXT[kind].noun}</span>
            <h3 className="font-serif text-2xl tracking-tight">{option.name}</h3>
          </header>
          <Details id={option.id} actions={actions} />
          <p className="text-muted-foreground px-4 pb-4 text-xs">{option.source}</p>
        </>
      ) : (
        <p className="text-muted-foreground p-4 text-sm">Hover over an option to read about it.</p>
      )}
    </section>
  )
}
