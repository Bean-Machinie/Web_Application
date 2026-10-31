import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ABILITY_METHODS } from "@/lib/character-templates/srd-5-2-1-quick"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import type { QuickRules } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { setMethod } from "./quick-ability-changes"
import { QuickIncreaseControls } from "./QuickIncreaseControls"

type Props = { actions: SheetActions; rules: QuickRules }

// What each method asks, from the SRD's Generate Your Scores (p. 21): the Standard Array
// (15, 14, 13, 12, 10, 8), Point Cost (27 points, scores 8 to 15) and Random Generation (four d6, the best three).
const RULE: Record<AbilityMethod, string> = {
  standard: "Assign 15, 14, 13, 12, 10 and 8, one to each ability.",
  "point-buy": "Spend 27 points. Scores run from 8 to 15, and the higher ones cost more.",
  own: "Roll four dice for each score and keep the best three. Roll six, then assign them.",
}

// The left panel of the Abilities workspace: how the scores are made, and the background's increase.
export function QuickAbilitiesPanel({ actions, rules }: Props) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold">Ability scores</h2>
      <div className="flex flex-col gap-2">
        <Tabs value={rules.method} onValueChange={(method) => setMethod(actions, rules, method as AbilityMethod)}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            {ABILITY_METHODS.map(({ id, label }) => (
              <TabsTrigger key={id} value={id} className="h-7 flex-none px-2 text-xs">{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-muted-foreground text-xs">{RULE[rules.method]} Changing the method starts the scores again.</p>
      </div>
      <QuickIncreaseControls actions={actions} />
    </div>
  )
}
