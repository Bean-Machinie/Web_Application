import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { characterBuildPath } from "@/lib/characters"
import { openLabel, openSlots, suggestedRows } from "@/lib/quick-review"
import type { Slot } from "@/lib/quick-slots"
import type { QuickRules } from "@/lib/quick-state"
import type { QuickView } from "@/lib/quick-view"

type Props = {
  characterId: string
  view: QuickView
  slots: Slot[]
  rules: QuickRules
  creating: boolean
  onOpen: (slot: string) => void
  onCreate: () => void
}

// Shown in place of the picker once the class, species and background are chosen: what Create
// character will fill in on its own, each with a way to change it, what is still open, and Create.
export function QuickReview({ characterId, view, slots, rules, creating, onOpen, onCreate }: Props) {
  const rows = suggestedRows(view, rules)
  const open = openSlots(slots)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Suggested for you</h3>
        <ul className="bg-card divide-y rounded-xl border shadow-xs">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="text-muted-foreground text-xs">{row.label}</span>
                <span className="truncate text-sm">{row.value}</span>
              </div>
              {row.slot ? (
                <Button variant="ghost" size="sm" onClick={() => onOpen(row.slot!)}>Change</Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={characterBuildPath(characterId, row.step)}>Change</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Still open</h3>
        {open.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {open.map((slot) => (
              <li key={slot.id}>
                <Button variant="outline" size="sm" onClick={() => onOpen(slot.id)}>{openLabel(slot)}</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Nothing left to choose in the sentence.</p>
        )}
      </section>
      <Button size="lg" className="self-start" disabled={creating} onClick={onCreate}>Create character</Button>
    </div>
  )
}
