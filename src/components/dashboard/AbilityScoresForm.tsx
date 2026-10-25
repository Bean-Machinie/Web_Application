import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ABILITIES, POINT_BUY_MIN } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { abilityFacts } from "./ability-facts"
import type { Roll, Scores } from "./ability-scores"
import { AbilityIncreaseStep } from "./AbilityIncreaseStep"
import { AbilityManual } from "./AbilityManual"
import { AbilityPointBuy } from "./AbilityPointBuy"
import { AbilityRoll } from "./AbilityRoll"
import { AbilityStandardArray } from "./AbilityStandardArray"
import type { SheetActions } from "./character-actions"

type Props = { actions: SheetActions; firstStep: 1 | 2; onClose: () => void }

const METHODS = [
  ["standard", "Standard array"],
  ["point-buy", "Point buy"],
  ["roll", "Roll"],
  ["manual", "Manual"],
] as const

// The two steps of setting scores. Step 1 makes the base scores by one of four methods; step
// 2 picks the background's increase. Nothing is written until Apply, which is enabled once
// all six base scores are set; the scores go to the score fields like any other edit.
export function AbilityScoresForm({ actions, firstStep, onClose }: Props) {
  const facts = abilityFacts(actions)
  const [step, setStep] = useState(firstStep)
  const [base, setBase] = useState<Scores>(() =>
    Object.fromEntries(ABILITIES.flatMap(([id]) => {
      const score = readStat(actions.values[id]?.value)
      return score === null ? [] : [[id, score]]
    }))
  )
  const complete = ABILITIES.every(([id]) => base[id] !== undefined)
  const [method, setMethod] = useState<string>(complete ? "manual" : "standard")
  const [increase, setIncrease] = useState(facts.increaseId)
  const [rolls, setRolls] = useState<Roll[] | null>(null)

  // A new method starts over, so no score is left from another one.
  function chooseMethod(next: string) {
    setMethod(next)
    if (next !== "manual") setBase(next === "point-buy" ? Object.fromEntries(ABILITIES.map(([id]) => [id, POINT_BUY_MIN])) : {})
  }

  function apply() {
    for (const [id] of ABILITIES) actions.onValue(id, base[id]!)
    if (facts.background) actions.onValue("ability-increase", increase)
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Ability scores</DialogTitle>
        <DialogDescription>Make the base scores, then add your background&apos;s increase.</DialogDescription>
      </DialogHeader>
      <ToggleGroup type="single" variant="outline" size="sm" value={String(step)} onValueChange={(next) => next && setStep(Number(next) as 1 | 2)} aria-label="Step" className="w-full">
        <ToggleGroupItem value="1" className="flex-1">1 · Base scores</ToggleGroupItem>
        <ToggleGroupItem value="2" className="flex-1">2 · Background increase</ToggleGroupItem>
      </ToggleGroup>
      {step === 1 ? (
        <Tabs value={method} onValueChange={chooseMethod}>
          <TabsList variant="line" className="mb-3 h-10 w-full justify-start">
            {METHODS.map(([id, label]) => (
              <TabsTrigger key={id} value={id} className="flex-none px-3">{label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="standard"><AbilityStandardArray base={base} facts={facts} onBase={setBase} /></TabsContent>
          <TabsContent value="point-buy"><AbilityPointBuy base={base} facts={facts} onBase={setBase} /></TabsContent>
          <TabsContent value="roll"><AbilityRoll rolls={rolls} base={base} facts={facts} onRoll={setRolls} onBase={setBase} /></TabsContent>
          <TabsContent value="manual"><AbilityManual base={base} facts={facts} onBase={setBase} /></TabsContent>
        </Tabs>
      ) : (
        <AbilityIncreaseStep base={base} facts={facts} increase={increase} onIncrease={setIncrease} />
      )}
      <DialogFooter className="sm:justify-between">
        {step === 1 ? (
          <Button variant="outline" onClick={() => setStep(2)}>Next: background increase</Button>
        ) : (
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={apply} disabled={!complete}>Apply scores</Button>
        </div>
      </DialogFooter>
    </>
  )
}
