import { Button } from "@/components/ui/button"
import type { Feature } from "@/lib/quick-card-features"
import { QuickAccordionRow } from "./QuickAccordionRow"

type Props = { feature: Feature; value: string; changed: boolean; onPick: ((pick: string) => void) | null; onReset: ((field: string, label: string) => void) | null }

// A feature as an accordion row. Opened, it gives the full description, the picks as a list, who
// chose it, and a Change button where there is something to choose, with Use suggested beside it
// when the pick is the player's own.
export function QuickFeatureRow({ feature, value, changed, onPick, onReset }: Props) {
  return (
    <QuickAccordionRow value={value} name={feature.name} text={feature.value} effect={feature.effect} changed={changed} className="border-0">
      <p className="text-muted-foreground text-[13px] leading-snug">{feature.description}</p>
      {feature.picks.length > 0 && (
        <ul className="text-muted-foreground list-disc pl-4 text-[13px]">
          {feature.picks.map((pick) => <li key={pick}>{pick}</li>)}
        </ul>
      )}
      {feature.pick && feature.chosen && <p className="text-muted-foreground text-xs">{feature.suggested ? "Suggested" : "Your choice"}</p>}
      {onPick && feature.pick && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => onPick(feature.pick!)}>Change</Button>
          {onReset && feature.resettable && <Button variant="ghost" size="sm" onClick={() => onReset(feature.pick!, feature.name)}>Use suggested</Button>}
        </div>
      )}
    </QuickAccordionRow>
  )
}
