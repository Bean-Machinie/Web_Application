import { AnimatePresence } from "motion/react"
import { Accordion } from "@/components/ui/accordion"
import type { CardModel } from "@/lib/quick-card"
import { has } from "@/lib/quick-card-format"
import { FEATURE_SLOTS } from "@/lib/quick-card-features"
import { QuickFeatureSlot } from "./QuickFeatureSlot"
import { QuickSection } from "./QuickSection"
import { SLOT_ICONS } from "./quick-icons"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null; onOpenSlot: (slot: string) => void; onReset: ((field: string, label: string) => void) | null }

// In the order of the sentence. Each shows once the one before it is chosen (or it is itself).
const SECTIONS = [
  { label: "Species", slot: "species", after: null },
  { label: "Class", slot: "class", after: "Species" },
  { label: "Background", slot: "background", after: "Class" },
] as const

// The sections come one at a time, each easing in under the last once that is chosen, with room for
// all its possible rows until something is chosen, then only its own: the others collapse. The rows
// are items of one Accordion, so one is open at a time.
export function QuickFeaturesTab({ shown, base, onPick, onOpenSlot, onReset }: Props) {
  const known = base.features.flatMap((card) => card.features)
  // What is chosen counts, not what is only tried on, so hovering does not bring a section in.
  const chosen = (label: string | null) => label === null || base.features.some((card) => card.label === label)

  return (
    <Accordion type="single" collapsible>
      <AnimatePresence initial={false}>
        {SECTIONS.filter(({ label, after }) => chosen(after) || chosen(label)).map(({ label, slot }) => {
          const card = shown.features.find((candidate) => candidate.label === label)
          return (
            <QuickSection key={label} reveal icon={SLOT_ICONS[slot]} title={card?.name ?? "Not chosen"} subtitle={card?.meta ?? label} placeholder={!card} onOpen={() => onOpenSlot(slot)}>
              <div className="flex flex-col">
                {Array.from({ length: FEATURE_SLOTS[label] }, (_, index) => {
                  const feature = card?.features[index]
                  const hidden = !!card && index >= card.features.length
                  return <QuickFeatureSlot key={index} feature={feature} value={`${label}:${index}`} hidden={hidden} changed={!!feature && !has(known, feature)} onPick={onPick} onReset={onReset} />
                })}
              </div>
            </QuickSection>
          )
        })}
      </AnimatePresence>
    </Accordion>
  )
}
