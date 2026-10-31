import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { LayoutListIcon } from "@/components/icons/LayoutListIcon"
import { MousePointerClickIcon } from "@/components/icons/MousePointerClickIcon"
import { SquarePenIcon } from "@/components/icons/SquarePenIcon"
import { abilityFacts } from "./ability-facts"
import { ABILITY_METHODS } from "@/lib/character-templates/srd-5-2-1-quick"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import type { QuickRules } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { MapSubToolButton } from "./MapSubToolButton"
import { MapToolSections } from "./MapToolSections"
import { setMethod } from "./quick-ability-changes"
import { QuickIncreaseControls } from "./QuickIncreaseControls"

type Props = { actions: SheetActions; rules: QuickRules }

// What each method is, from the SRD's Generate Your Scores (p. 21): the Standard Array
// (15, 14, 13, 12, 10, 8) and Point Cost (27 points, scores 8 to 15); Custom takes any score, for rolled ones or a GM's.
const METHODS: Record<AbilityMethod, { icon: AnimatedIconComponent; detail: string }> = {
  standard: { icon: LayoutListIcon, detail: "15, 14, 13, 12, 10, 8" },
  "point-buy": { icon: MousePointerClickIcon, detail: "27 points, 8 to 15" },
  own: { icon: SquarePenIcon, detail: "Any score you like" },
}

// The left panel of the Abilities workspace, made as the map builder's tool panel is: the methods
// as its list of sub tools, and under them the background's increase as its properties.
export function QuickAbilitiesPanel({ actions, rules }: Props) {
  const { background } = abilityFacts(actions)

  return (
    <MapToolSections
      layoutId="quick-builder-panel"
      sections={[
        {
          id: "main",
          title: "Ability scores",
          content: (
            <div className="grid gap-1 p-2">
              {ABILITY_METHODS.map(({ id, label }) => {
                const { icon: Icon, detail } = METHODS[id]
                return (
                  <MapSubToolButton key={id} label={label} detail={detail} tall active={rules.method === id} onClick={() => id !== rules.method && setMethod(actions, rules, id)}>
                    <HoverIcon icon={Icon} size={22} />
                  </MapSubToolButton>
                )
              })}
              <p className="text-muted-foreground px-1 pt-2 text-xs">Changing the method starts the scores again.</p>
            </div>
          ),
        },
        { id: "properties", title: background ? `${background.label} increase` : "Background increase", content: <QuickIncreaseControls actions={actions} /> },
      ]}
    />
  )
}
