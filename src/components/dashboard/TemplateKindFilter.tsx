import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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

const Count = ({ children }: { children: number }) => (
  <span className="text-muted-foreground text-xs tabular-nums">{children}</span>
)

// Chips to show one kind of the starter's entries, or all: the kind's icon, its name and how
// many there are.
export function TemplateKindFilter({ template, value, onChange }: Props) {
  const countOf = (kind: WorldEntryKind) => template.entries.filter((entry) => entry.kind === kind).length

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      aria-label="Show entries of a kind"
      value={value}
      // Pressing the chosen chip again would clear it; "All" is the way back.
      onValueChange={(next) => next && onChange(next as KindFilter)}
      className="flex-wrap"
    >
      <ToggleGroupItem value="all">
        All <Count>{template.entries.length}</Count>
      </ToggleGroupItem>
      {templateKinds(template).map((kind) => {
        const { icon: Icon, plural } = WORLD_KINDS[kind]
        return (
          <ToggleGroupItem key={kind} value={kind}>
            <Icon />
            {plural} <Count>{countOf(kind)}</Count>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
