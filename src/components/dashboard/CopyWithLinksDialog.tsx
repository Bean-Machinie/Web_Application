import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Asking, CopyChoiceDialog } from "@/hooks/use-copy-choice"
import { reachFrom } from "@/lib/world-copy-plan"
import { CopyChoiceOption } from "./CopyChoiceOption"
import { CopyDuplicatesQuestion } from "./CopyDuplicatesQuestion"
import { CopyPlanList } from "./CopyPlanList"

const entries = (count: number) => `${count} linked ${count === 1 ? "entry" : "entries"}`

// Only mounted while asking, so it starts on the same answer every time.
function Question({
  asking,
  onChoose,
}: {
  asking: Extract<Asking, { kind: "links" }>
  onChoose: CopyChoiceDialog["onChoose"]
}) {
  const { plan, target, picked } = asking
  const [withLinks, setWithLinks] = useState(true)
  const [unticked, setUnticked] = useState<ReadonlySet<string>>(new Set())
  const reach = useMemo(() => reachFrom(plan, unticked), [plan, unticked])
  const many = picked > 1
  const what = many ? "Selected" : "Entry"
  const count = reach.included.size

  function toggle(entryId: string) {
    const next = new Set(unticked)
    if (!next.delete(entryId)) next.add(entryId)
    setUnticked(next)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{many ? "These entries link to others" : "This entry links to others"}</DialogTitle>
        <DialogDescription>
          Choose whether what {many ? "they link" : "it links"} comes with {many ? "them" : "it"}.
        </DialogDescription>
      </DialogHeader>
      <div role="radiogroup" className="grid gap-2">
        <CopyChoiceOption
          selected={!withLinks}
          title={`${what} only`}
          description="Copy just what you picked. Links to entries already here are kept; the rest become plain text, or pins are dropped."
          onSelect={() => setWithLinks(false)}
        />
        <CopyChoiceOption
          selected={withLinks}
          title={count > 0 ? `${what} and ${entries(count)}` : `${what} and ${many ? "their" : "its"} links`}
          description="Choose below which linked entries come too. The copies keep their links to what comes along."
          onSelect={() => setWithLinks(true)}
        />
      </div>
      {withLinks && (
        <div className="grid gap-2">
          <p className="text-muted-foreground text-[13px]">
            {count} new, {reach.present.size} already here
            {reach.left.size > 0 && `, ${reach.left.size} left out`}
          </p>
          <CopyPlanList plan={plan} reach={reach} unticked={unticked} onToggle={toggle} />
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onChoose(null)}>
          Cancel
        </Button>
        <Button onClick={() => onChoose(withLinks ? [...reach.included] : [])}>
          {target.campaignId === null ? "Save to library" : "Add to campaign"}
        </Button>
      </DialogFooter>
    </>
  )
}

// What a copy asks. First, when the target already has a copy of something picked:
// whether to add another. Then, when what is picked links to entries the target
// does not have: only what was picked, or also the linked entries that are ticked,
// which bring what only they link, and so on.
export function CopyWithLinksDialog({ asking, onChoose }: CopyChoiceDialog) {
  return (
    <Dialog open={asking !== null} onOpenChange={(next) => !next && onChoose(null)}>
      <DialogContent className="sm:max-w-lg">
        {asking?.kind === "links" && <Question asking={asking} onChoose={onChoose} />}
        {asking?.kind === "duplicates" && (
          <CopyDuplicatesQuestion asking={asking} onChoose={onChoose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
