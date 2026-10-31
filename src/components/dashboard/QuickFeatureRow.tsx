import { Badge } from "@/components/ui/badge"
import type { Feature } from "@/lib/quick-card-features"
import { featureIcon } from "./feature-icon"
import { QuickChoicePill } from "./QuickChoicePill"
import { QuickItemRow } from "./QuickItemRow"
import { QuickValue } from "./QuickValue"

type Props = { feature: Feature; changed: boolean; onPick: ((pick: string) => void) | null }

// A feature as a row. What can be chosen is a pill that opens its panel: the pick itself, or for
// weapon masteries each chip.
export function QuickFeatureRow({ feature, changed, onPick }: Props) {
  const Icon = featureIcon(feature.eyebrow, feature.title)
  const open = onPick && feature.pick ? () => onPick(feature.pick!) : null
  const pill = (value: string) => <QuickChoicePill key={value} value={value} suggested={feature.suggested} chosen={feature.chosen} onClick={open} />
  const extras = (feature.chips.length > 0 || feature.uses) && (
    <>
      {feature.chips.map(pill)}
      {feature.uses && <Badge variant="secondary" className="rounded-[4px] font-normal">{feature.uses}</Badge>}
    </>
  )

  return (
    <QuickItemRow
      icon={<Icon />}
      eyebrow={feature.eyebrow}
      title={feature.eyebrow ? pill(feature.title) : <QuickValue value={feature.title} changed={changed} className="-ml-1" />}
      description={feature.description}
      extras={extras || undefined}
    />
  )
}
