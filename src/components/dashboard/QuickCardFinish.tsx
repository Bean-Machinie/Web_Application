import type { Attention } from "@/lib/quick-attention"
import { openLabel } from "@/lib/quick-review"
import type { Slot } from "@/lib/quick-slots"

type Props = {
  // The open slots of the sentence, and the other picks that need the player.
  open: Slot[]
  needs: Attention[]
  onOpen: (slot: string) => void
  onPick: (pick: string) => void
}

// "To finish": what is open in the sentence and what else needs a pick, each opening its picker
// or its panel. Languages are in the sentence, so they are only listed there.
export function QuickCardFinish({ open, needs, onOpen, onPick }: Props) {
  const languages = open.filter((slot) => slot.kind === "language")
  const items = [
    ...open.filter((slot) => slot.kind !== "language").map((slot) => ({ id: slot.id, label: openLabel(slot), run: () => onOpen(slot.id) })),
    ...(languages.length > 0 ? [{ id: languages[0].id, label: languages.length === 1 ? "Language" : `${languages.length} languages`, run: () => onOpen(languages[0].id) }] : []),
    ...needs.filter((need) => need.key !== "languages").map((need) => ({ id: need.key, label: need.label, run: () => onPick(need.key) })),
  ]
  if (items.length === 0) return null

  return (
    <section aria-label="To finish" className="flex flex-col gap-1 border-t pt-3">
      <h3 className="text-muted-foreground text-xs font-medium">To finish</h3>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={item.run} className="focus-visible:ring-ring rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2">
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
