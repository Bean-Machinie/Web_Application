import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { STANDARD_ARRAY } from "@/lib/character-templates/srd-5-2-1-scores"
import type { Scores } from "@/lib/quick-abilities"
import { cn } from "@/lib/utils"

type Props = {
  id: AbilityId
  label: string
  scores: Scores
  onPick: (score: number) => void
}

// The base score as part of a line of text that opens the six numbers of the Standard Array. The
// one this ability has is marked; a number another ability holds says which, and is swapped.
export function QuickScorePicker({ id, label, scores, onPick }: Props) {
  const [open, setOpen] = useState(false)
  const value = scores[id]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label} base score: choose a number`}
          className="text-foreground decoration-muted-foreground/60 hover:decoration-foreground focus-visible:decoration-foreground w-[2ch] cursor-pointer text-center font-medium tabular-nums underline decoration-dotted decoration-1 underline-offset-4 outline-none focus-visible:decoration-solid"
        >
          {value ?? "–"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="center">
        <div role="listbox" aria-label={`${label} score`} className="grid grid-cols-3 gap-1">
          {STANDARD_ARRAY.map((number) => {
            const holder = ABILITIES.find(([other]) => other !== id && scores[other] === number)?.[0]
            return (
              <button
                key={number}
                type="button"
                role="option"
                aria-selected={value === number}
                className={cn("hover:bg-accent focus-visible:ring-ring flex h-11 w-12 flex-col items-center justify-center rounded-md text-sm font-medium tabular-nums outline-none focus-visible:ring-2", value === number && "bg-accent ring-foreground/30 ring-1")}
                onClick={() => {
                  onPick(number)
                  setOpen(false)
                }}
              >
                {number}
                <span className="text-muted-foreground text-[10px] leading-none font-normal uppercase">{holder ?? (value === number ? id : "free")}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
