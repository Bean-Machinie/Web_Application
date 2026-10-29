import type { KeyboardEvent } from "react"
import { QUICK_KINDS } from "@/lib/quick-options"
import type { Slot } from "@/lib/quick-slots"
import { QuickTile } from "./QuickTile"

type Props = {
  slot: Slot
  onSelect: (id: string) => void
  onLearn: (id: string) => void
  onPreview: (id: string | null) => void
}

const NEXT = ["ArrowRight", "ArrowDown"]
const PREVIOUS = ["ArrowLeft", "ArrowUp"]

// The options of the open slot as a grid of compact tiles; the arrow keys move between them.
export function QuickGrid({ slot, onSelect, onLearn, onPreview }: Props) {
  const main = (QUICK_KINDS as string[]).includes(slot.kind)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (![...NEXT, ...PREVIOUS].includes(event.key)) return
    const tiles = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-option] > button")]
    const next = tiles[tiles.indexOf(document.activeElement as HTMLButtonElement) + (NEXT.includes(event.key) ? 1 : -1)]
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  return (
    <div
      role="group"
      aria-label={`Options for ${slot.placeholder}`}
      onKeyDown={onKeyDown}
      className={`grid gap-2 ${main ? "grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]"}`}
    >
      {slot.options.map((option) => (
        <QuickTile
          key={option.id}
          slotId={slot.id}
          kind={slot.kind}
          option={option}
          selected={slot.chosen === option.id}
          compact={!main}
          onLearn={main ? () => onLearn(option.id) : undefined}
          onSelect={() => onSelect(option.id)}
          onPreview={(on) => onPreview(on ? option.id : null)}
        />
      ))}
    </div>
  )
}
