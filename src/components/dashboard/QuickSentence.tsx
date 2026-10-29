import { chosenName } from "@/lib/quick-slots"
import type { Slot } from "@/lib/quick-slots"
import { QuickSlotButton } from "./QuickSlotButton"

type Props = { slots: Slot[]; openId: string | null; onToggle: (slot: string) => void }

const article = (word: string | null) => (word && /^[aeiou]/i.test(word) ? "an" : "a")

// The words before a slot: "I’m a", "who fights", "was a", ", and speaks".
function lead(slot: Slot, slots: Slot[]) {
  const word = chosenName(slot)
  if (slot.kind === "species") return `I’m ${article(word)}`
  if (slot.kind === "approach") return "who fights"
  if (slot.kind === "background") return `${slots.some((other) => other.kind === "approach") ? "and" : "who"} was ${article(word)}`
  if (slot.id === "language-0") return "and speaks"
  return slot.kind === "language" ? "and" : null
}

// "I’m a [species] [class] who was a [background]." Each bracket opens the strip of its options.
export function QuickSentence({ slots, openId, onToggle }: Props) {
  return (
    <h2 className="font-serif text-3xl/[1.9] tracking-tight min-[600px]:text-4xl/[1.9]">
      {slots.map((slot) => (
        <span key={slot.id}>
          {lead(slot, slots)}
          {" "}
          <QuickSlotButton
            label={chosenName(slot)}
            placeholder={slot.placeholder}
            chosenId={slot.chosen}
            slotId={slot.id}
            open={openId === slot.id}
            onClick={() => onToggle(slot.id)}
          />{" "}
        </span>
      ))}
      <span aria-hidden>.</span>
    </h2>
  )
}
