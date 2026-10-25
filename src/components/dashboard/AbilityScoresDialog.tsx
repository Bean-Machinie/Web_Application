import { useState } from "react"
import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ABILITIES, STANDARD_ARRAY } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import type { SheetActions } from "./character-actions"
import type { Scores } from "./ability-scores"
import { AbilityAssign } from "./AbilityAssign"
import { AbilityManual } from "./AbilityManual"
import { AbilityPointBuy } from "./AbilityPointBuy"
import { AbilityRoll } from "./AbilityRoll"

// A helper for the base ability scores, opened from the Ability scores section. Whichever
// way the scores are made, they are written to the score fields like any other edit.
export function AbilityScoresDialog({ actions }: { actions: SheetActions }) {
  const [open, setOpen] = useState(false)
  const current: Scores = Object.fromEntries(
    ABILITIES.flatMap(([id]) => {
      const score = readStat(actions.values[id]?.value)
      return score === null ? [] : [[id, score]]
    })
  )

  function apply(scores: Scores) {
    for (const [id, score] of Object.entries(scores)) actions.onValue(id, score)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground -my-1">
          <Dices />
          Set scores
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ability scores</DialogTitle>
          <DialogDescription>Make the base scores, before your background&apos;s increase.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="standard">
          <TabsList variant="line" className="mb-4 h-10 w-full justify-start">
            <TabsTrigger value="standard" className="flex-none px-3">Standard array</TabsTrigger>
            <TabsTrigger value="point-buy" className="flex-none px-3">Point buy</TabsTrigger>
            <TabsTrigger value="roll" className="flex-none px-3">Roll</TabsTrigger>
            <TabsTrigger value="manual" className="flex-none px-3">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="standard">
            <AbilityAssign pool={STANDARD_ARRAY} onApply={apply} />
          </TabsContent>
          <TabsContent value="point-buy">
            <AbilityPointBuy onApply={apply} />
          </TabsContent>
          <TabsContent value="roll">
            <AbilityRoll onApply={apply} />
          </TabsContent>
          <TabsContent value="manual">
            <AbilityManual current={current} onApply={apply} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
