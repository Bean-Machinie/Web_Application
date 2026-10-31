import type { CardModel } from "@/lib/quick-card"
import { has } from "@/lib/quick-card-format"
import { QuickFeatureRow } from "./QuickFeatureRow"
import { QuickSection } from "./QuickSection"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// The class, the background and the species, each a section of features.
export function QuickFeaturesTab({ shown, base, onPick }: Props) {
  const known = base.features.flatMap((card) => card.features)
  if (shown.features.length === 0) return <p className="text-muted-foreground text-sm">Choose a class, species and background to see your features.</p>

  return (
    <div className="flex flex-col">
      {shown.features.map((card) => (
        <QuickSection key={card.label} label={card.label} name={card.name}>
          {card.features.map((feature) => (
            <QuickFeatureRow key={`${feature.eyebrow}${feature.title}`} feature={feature} changed={!has(known, feature)} onPick={onPick} />
          ))}
        </QuickSection>
      ))}
    </div>
  )
}
