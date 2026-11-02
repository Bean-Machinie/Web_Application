import { SegmentedControl } from "@/components/ui/segmented-control"
import type { CampaignTemplate } from "@/lib/campaign-template-types"
import { templateKinds } from "@/lib/campaign-templates"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

export type KindFilter = WorldEntryKind | "all"

type Props = {
  template: CampaignTemplate
  value: KindFilter
  onChange: (value: KindFilter) => void
}

const named = (name: string, count: number) => (
  <>
    {name} <span className="opacity-60">{count}</span>
  </>
)

// Tabs to show one kind of the starter's entries, or all: the kind's name and how many there are.
export function TemplateKindFilter({ template, value, onChange }: Props) {
  const countOf = (kind: WorldEntryKind) => template.entries.filter((entry) => entry.kind === kind).length

  return (
    <SegmentedControl
      aria-label="Show entries of a kind"
      value={value}
      onValueChange={onChange}
      className="w-fit"
      options={[
        { value: "all", label: named("All", template.entries.length) },
        ...templateKinds(template).map((kind) => ({
          value: kind as KindFilter,
          label: named(WORLD_KINDS[kind].plural, countOf(kind)),
        })),
      ]}
    />
  )
}
