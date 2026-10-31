import type { CardModel } from "@/lib/quick-card"
import { has } from "@/lib/quick-card-format"
import { QuickEditButton } from "./QuickEditButton"
import { QuickSectionHeader } from "./QuickSectionHeader"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// The feats, then the class's features and the species' traits: name, source and a line on what it does.
export function QuickFeaturesTab({ shown, base, onPick }: Props) {
  const known = base.features.flatMap((group) => group.features)
  if (shown.features.length === 0) return <p className="text-muted-foreground text-sm">Choose a class, species and background to see your features.</p>

  return (
    <div className="flex flex-col gap-4">
      {shown.features.map((group) => (
        <section key={group.title} aria-label={group.title} className="flex flex-col gap-1">
          <QuickSectionHeader title={group.title} />
          <ul className="flex flex-col gap-2">
            {group.features.map((feature) => (
              <li key={`${feature.name}${feature.source}`} className="flex items-start justify-between gap-2">
                <div className="min-w-0 text-sm">
                  <QuickValue value={feature.name} changed={!has(known, feature)} className="-ml-1" />
                  <span className="text-muted-foreground text-xs"> · {feature.source}</span>
                  <p className="text-muted-foreground text-xs">{feature.summary}</p>
                </div>
                {onPick && feature.pick && <QuickEditButton label={`Edit ${feature.name}`} onClick={() => onPick(feature.pick!)} />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
