import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Asking, CopyChoiceDialog } from "@/hooks/use-copy-choice"
import { KindLabel } from "./KindLabel"

type Props = {
  asking: Extract<Asking, { kind: "duplicates" }>
  onChoose: CopyChoiceDialog["onChoose"]
}

// Shown before a copy that would duplicate something: one entry gets "Skip" or
// "Add another copy"; several get a list to tick the ones that should be copied
// again, and the rest are skipped. Nothing is ticked to begin with.
export function CopyDuplicatesQuestion({ asking, onChoose }: Props) {
  const { entries, target, picked } = asking
  const [again, setAgain] = useState<ReadonlySet<string>>(new Set())
  const where = target.campaignId === null ? "your library" : "this campaign"

  if (entries.length === 1) {
    const [only] = entries
    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {only.name} is already in {where}
          </DialogTitle>
          <DialogDescription>
            {picked > 1
              ? "Add another copy? The other entries you picked are copied either way."
              : "Add another copy?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onChoose([])}>
            Skip
          </Button>
          <Button onClick={() => onChoose([only.id])}>Add another copy</Button>
        </DialogFooter>
      </>
    )
  }

  function toggle(id: string) {
    const next = new Set(again)
    if (!next.delete(id)) next.add(id)
    setAgain(next)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {entries.length} of the {picked} entries are already in {where}
        </DialogTitle>
        <DialogDescription>
          Tick the ones you want another copy of. The others are skipped.
        </DialogDescription>
      </DialogHeader>
      <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2">
              <Checkbox
                checked={again.has(entry.id)}
                aria-label={`Add another copy of ${entry.name}`}
                onCheckedChange={() => toggle(entry.id)}
              />
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="truncate text-sm">{entry.name}</span>
                <KindLabel kind={entry.kind} />
              </span>
            </label>
          </li>
        ))}
      </ul>
      <DialogFooter>
        <Button variant="outline" onClick={() => onChoose(null)}>
          Cancel
        </Button>
        <Button onClick={() => onChoose([...again])}>Continue</Button>
      </DialogFooter>
    </>
  )
}
