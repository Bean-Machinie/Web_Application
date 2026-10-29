import { chosenName } from "@/lib/quick-slots"
import type { Slot } from "@/lib/quick-slots"
import { QuickSlotButton } from "./QuickSlotButton"

type Props = { slots: Slot[]; openId: string | null; onToggle: (slot: string) => void }

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a")

// A size reads as an adjective, so in lower case.
const wordOf = (slot: Slot) => {
  const name = chosenName(slot)
  return name && slot.kind === "size" ? name.toLowerCase() : name
}

// The words before a slot: "I’m a", "who fights", "who was a", ", and I speak". A comma sticks
// to the word before it.
function lead(slot: Slot, index: number, slots: Slot[]) {
  if (index === 0) return `I’m ${article(wordOf(slot) ?? slot.placeholder)}`
  if (slot.kind === "approach") return "who fights"
  if (slot.kind === "background") return `${slots.some((other) => other.kind === "approach") ? "and" : "who"} was ${article(wordOf(slot) ?? slot.placeholder)}`
  if (slot.id === "language-0") return ", and I speak"
  return slot.kind === "language" ? "and" : null
}

// "I’m a [species] [class] who was a [background]." Each word opens the picker of its options.
export function QuickSentence({ slots, openId, onToggle }: Props) {
  return (
    <h2 className="text-muted-foreground font-serif text-3xl/[1.7] font-normal tracking-tight italic min-[1280px]:text-4xl/[1.65]">
      {slots.map((slot, index) => {
        const before = lead(slot, index, slots)
        return (
          <span key={slot.id}>
            {index > 0 && !before?.startsWith(",") && " "}
            {before && `${before} `}
            <QuickSlotButton word={wordOf(slot)} placeholder={slot.placeholder} chosenId={slot.chosen} slotId={slot.id} open={openId === slot.id} onClick={() => onToggle(slot.id)} />
          </span>
        )
      })}
      <span aria-hidden>.</span>
    </h2>
  )
}
