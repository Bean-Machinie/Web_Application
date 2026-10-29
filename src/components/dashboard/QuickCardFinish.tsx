import { openLabel } from "@/lib/quick-review"
import type { Slot } from "@/lib/quick-slots"

type Props = { open: Slot[]; onOpen: (slot: string) => void }

// "To finish": the brackets of the sentence still empty, each opening its picker.
export function QuickCardFinish({ open, onOpen }: Props) {
  const languages = open.filter((slot) => slot.kind === "language")
  const items = [
    ...open.filter((slot) => slot.kind !== "language").map((slot) => ({ id: slot.id, label: openLabel(slot) })),
    ...(languages.length > 0 ? [{ id: languages[0].id, label: languages.length === 1 ? "Language" : `${languages.length} languages` }] : []),
  ]
  if (items.length === 0) return null

  return (
    <section aria-label="To finish" className="flex flex-col gap-1 border-t pt-3">
      <h3 className="text-muted-foreground text-xs font-medium">To finish</h3>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onOpen(item.id)} className="focus-visible:ring-ring rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2">
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
