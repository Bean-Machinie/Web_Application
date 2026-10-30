import { Button } from "@/components/ui/button"
import { pickKeyOf } from "@/lib/pick-info"
import type { Attention } from "@/lib/quick-attention"
import { openLabel, suggestedRows } from "@/lib/quick-review"
import { openSlots } from "@/lib/quick-slots"
import type { Slot } from "@/lib/quick-slots"
import type { StoredValue } from "@/lib/characters"

type Props = {
  values: Record<string, StoredValue>
  slots: Slot[]
  creating: boolean
  onOpen: (slot: string) => void
  needs: Attention[]
  onPick: (pick: string) => void
  onCreate: () => void
}

// Shown in place of the picker once the class, species and background are chosen: what Create
// character holds as suggestions, each with a way to change it, what is still open, and Create.
export function QuickReview({ values, slots, needs, creating, onOpen, onPick, onCreate }: Props) {
  const rows = suggestedRows(values)
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
              <Button variant="ghost" size="sm" onClick={() => (row.slot ? onOpen(row.slot) : onPick(pickKeyOf(row.key)))}>Change</Button>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Still open</h3>
        {open.length + needs.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {open.map((slot) => (
              <li key={slot.id}>
                <Button variant="outline" size="sm" onClick={() => onOpen(slot.id)}>{openLabel(slot)}</Button>
              </li>
            ))}
            {needs.map((need) => (
              <li key={need.key}>
                <Button variant="outline" size="sm" onClick={() => onPick(pickKeyOf(need.key))}>{need.label}</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Nothing left to choose.</p>
        )}
      </section>
      <Button size="lg" className="self-start" disabled={creating} onClick={onCreate}>Create character</Button>
    </div>
  )
}
