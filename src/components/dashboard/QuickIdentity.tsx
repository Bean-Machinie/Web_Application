import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { chosenOption, picksOf } from "@/lib/character-grants"
import { SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { SPECIES_CHOICES } from "@/lib/character-templates/srd-5-2-1-origins"
import type { OptionDecl } from "@/lib/character-templates/srd-5-2-1-choices"
import { cn } from "@/lib/utils"
import type { SheetActions } from "./character-actions"

type Row = { title: string; options: OptionDecl[]; chosen: string | undefined; onChoose: (id: string) => void }

const SIZE_OPTIONS: OptionDecl[] = [
  { id: "medium", label: "Medium", note: "About 4–7 ft tall." },
  { id: "small", label: "Small", note: "About 2–4 ft tall." },
]

// The species’ defining choices as rows of small chips on its card: an ancestry, lineage or
// legacy, and the size of a Human or Tiefling. A note on each is its tooltip.
export function QuickIdentity({ speciesId, actions }: { speciesId: string; actions: SheetActions }) {
  const decl = SPECIES_CHOICES[speciesId]?.find((candidate) => candidate.kind === "options" && candidate.field === "species-option")
  const rows: Row[] = []
  if (decl?.kind === "options") {
    rows.push({ title: decl.title, options: decl.options, chosen: picksOf(actions, decl.field)[0], onChoose: (id) => actions.onValue(decl.field, [id]) })
  }
  if (SPECIES.find((species) => species.id === speciesId)?.sizeChoice) {
    rows.push({ title: "Size", options: SIZE_OPTIONS, chosen: chosenOption(actions, "size")?.id, onChoose: (id) => actions.onValue("size", id) })
  }
  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.title} role="group" aria-label={row.title} className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-white/60">{row.title}</span>
          {row.options.map((option) => (
            <Tooltip key={option.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-pressed={option.id === row.chosen}
                  onClick={() => row.onChoose(option.id)}
                  className={cn(
                    "h-6 rounded-full border px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                    option.id === row.chosen ? "border-white bg-white text-black" : "border-white/30 text-white hover:bg-white/10"
                  )}
                >
                  {option.label}
                </button>
              </TooltipTrigger>
              {option.note && <TooltipContent>{option.note}</TooltipContent>}
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  )
}
