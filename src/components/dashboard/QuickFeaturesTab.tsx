import { useState } from "react"
import { AnimatePresence } from "motion/react"
import type { CardModel } from "@/lib/quick-card"
import { has } from "@/lib/quick-card-format"
import { FEATURE_SLOTS } from "@/lib/quick-card-features"
import { QuickFeatureSlot } from "./QuickFeatureSlot"
import { QuickSection } from "./QuickSection"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null; onOpenSlot: (slot: string) => void }

// In the order of the sentence. Each shows once the one before it is chosen (or it is itself).
const SECTIONS = [
  { label: "Species", slot: "species", after: null },
  { label: "Class", slot: "class", after: "Species" },
  { label: "Background", slot: "background", after: "Class" },
] as const

// The sections come one at a time, each easing in under the last once that is chosen, with room for
// all its possible rows until something is chosen, then only its own: the others collapse. One row is open at a time.
export function QuickFeaturesTab({ shown, base, onPick, onOpenSlot }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const known = base.features.flatMap((card) => card.features)
  // What is chosen counts, not what is only tried on, so hovering does not bring a section in.
  const chosen = (label: string | null) => label === null || base.features.some((card) => card.label === label)

  return (
    <div className="flex flex-col">
      <AnimatePresence initial={false}>
        {SECTIONS.filter(({ label, after }) => chosen(after) || chosen(label)).map(({ label, slot }) => {
          const card = shown.features.find((candidate) => candidate.label === label)
          return (
            <QuickSection
              key={label}
              reveal
              label={label}
              name={card?.name ?? "Not chosen"}
              placeholder={!card}
              onOpen={() => onOpenSlot(slot)}
              end={card?.level != null && <span className="text-muted-foreground text-xs">Level {card.level}</span>}
            >
              <ul className="-mx-2 flex flex-col">
                {Array.from({ length: FEATURE_SLOTS[label] }, (_, index) => {
                  const feature = card?.features[index]
                  const key = `${label}:${index}`
                  const hidden = !!card && index >= card.features.length
                  return <QuickFeatureSlot key={key} feature={feature} hidden={hidden} changed={!!feature && !has(known, feature)} open={open === key} onToggle={() => setOpen(open === key ? null : key)} onPick={onPick} />
                })}
              </ul>
            </QuickSection>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
