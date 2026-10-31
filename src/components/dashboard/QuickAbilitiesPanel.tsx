import { Coins, Dices, ListOrdered } from "lucide-react"
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
// (15, 14, 13, 12, 10, 8), Point Cost (27 points, scores 8 to 15) and Random Generation (four d6, the best three).
const METHODS: Record<AbilityMethod, { icon: typeof Dices; detail: string }> = {
  standard: { icon: ListOrdered, detail: "15, 14, 13, 12, 10, 8" },
  "point-buy": { icon: Coins, detail: "27 points, 8 to 15" },
  own: { icon: Dices, detail: "Four dice, keep the best three" },
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
                  <MapSubToolButton key={id} label={label} hint={detail} active={rules.method === id} onClick={() => id !== rules.method && setMethod(actions, rules, id)}>
                    <Icon />
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
