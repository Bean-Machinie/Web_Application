import { Button } from "@/components/ui/button"
import type { Feature } from "@/lib/quick-card-features"
import { featureIcon } from "./feature-icon"
import { QuickPropertyRow } from "./QuickPropertyRow"

type Props = {
  feature: Feature
  changed: boolean
  open: boolean
  onToggle: () => void
  onPick: ((pick: string) => void) | null
}

// A feature as a row of the property list. Opened, it gives the full description, the picks as a
// list, who chose it, and a Change button where there is something to choose.
export function QuickFeatureRow({ feature, changed, open, onToggle, onPick }: Props) {
  return (
    <QuickPropertyRow
      icon={featureIcon(feature.name, feature.value)}
      name={feature.name}
      value={feature.value}
      effect={feature.effect}
      placeholder={!feature.chosen && feature.pick !== null}
      suggested={feature.chosen && feature.suggested}
      changed={changed}
      animated
      open={open}
      onToggle={onToggle}
    >
      <p className="text-muted-foreground text-[13px] leading-snug">{feature.description}</p>
      {feature.picks.length > 0 && (
        <ul className="text-muted-foreground list-disc pl-4 text-[13px]">
          {feature.picks.map((pick) => <li key={pick}>{pick}</li>)}
        </ul>
      )}
      {feature.pick && feature.chosen && <p className="text-muted-foreground text-xs">{feature.suggested ? "Suggested" : "Your choice"}</p>}
      {onPick && feature.pick && (
        <Button variant="secondary" size="sm" onClick={() => onPick(feature.pick!)}>Change</Button>
      )}
    </QuickPropertyRow>
  )
}
