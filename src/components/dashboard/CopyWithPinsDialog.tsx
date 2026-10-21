import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CopyChoiceDialog, Asking } from "@/hooks/use-copy-choice"
import { summarizePlan } from "@/lib/world-copy-plan"
import type { CopyChoice } from "@/lib/world-copy-flow"
import { CopyChoiceOption } from "./CopyChoiceOption"
import { CopyPlanList } from "./CopyPlanList"

const entries = (count: number) => `${count} linked ${count === 1 ? "entry" : "entries"}`

// Only mounted while asking, so it starts on the same answer every time.
function Question({ asking, onChoose }: { asking: Asking; onChoose: CopyChoiceDialog["onChoose"] }) {
  const [choice, setChoice] = useState<CopyChoice>("pins")
  const { linked, fresh, present, maps } = summarizePlan(asking.plan)
  const many = maps > 1
  const toLibrary = asking.target.campaignId === null

  return (
    <>
      <DialogHeader>
        <DialogTitle>{many ? "These maps have pins" : "This map has pins"}</DialogTitle>
        <DialogDescription>
          Choose whether the pins come with {many ? "them" : "it"}.
        </DialogDescription>
      </DialogHeader>
      <div role="radiogroup" className="grid gap-2">
        <CopyChoiceOption
          selected={choice === "map-only"}
          title={many ? "Maps only" : "Map only"}
          description={`Copy ${many ? "the maps" : "the map"} without any pins.`}
          onSelect={() => setChoice("map-only")}
        />
        <CopyChoiceOption
          selected={choice === "pins"}
          title={
            fresh > 0
              ? `${many ? "Maps" : "Map"}, pins and ${entries(fresh)}`
              : `${many ? "Maps" : "Map"} and pins`
          }
          description={
            fresh > 0
              ? "The pins keep their places and link to copies of what they linked."
              : "Everything the pins link is already here, so they link to what you have."
          }
          onSelect={() => setChoice("pins")}
        />
      </div>
      {choice === "pins" && linked.length > 0 && (
        <div className="grid gap-2">
          <p className="text-muted-foreground text-[13px]">
            {fresh} new, {present} already here
          </p>
          <CopyPlanList rows={linked} />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onChoose(null)}>
          Cancel
        </Button>
        <Button onClick={() => onChoose(choice)}>
          {toLibrary ? "Save to library" : "Add to campaign"}
        </Button>
      </DialogFooter>
    </>
  )
}

// What a copy asks when a map has pins: the map alone, or with its pins and
// what they link. Linked maps count too, with their own pins.
export function CopyWithPinsDialog({ asking, onChoose }: CopyChoiceDialog) {
  return (
    <Dialog open={asking !== null} onOpenChange={(next) => !next && onChoose(null)}>
      <DialogContent className="sm:max-w-lg">
        {asking && <Question asking={asking} onChoose={onChoose} />}
      </DialogContent>
    </Dialog>
  )
}
