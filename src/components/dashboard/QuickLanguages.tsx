import { Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { origins, picksOf } from "@/lib/character-grants"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { LANGUAGES_TO_PICK } from "@/lib/character-templates/srd-5-2-1-gear"
import { SPECIES_LANGUAGES } from "@/lib/character-templates/srd-5-2-1-quick"
import { BuilderChipPicker } from "./BuilderChipPicker"
import { languageChips } from "./builder-chips"
import type { SheetActions } from "./character-actions"

const CHIP = "flex h-6 items-center rounded-full border px-2.5 text-xs"

// Under the portrait: Common, and the languages picked, or the ones the species suggests until
// the player picks. Clicking opens the Standard Languages to pick from.
export function QuickLanguages({ actions, speciesId }: { actions: SheetActions; speciesId: string }) {
  const { cls } = origins(actions)
  const count = LANGUAGES_TO_PICK + (cls ? CLASS_BUILD[cls.id].extraLanguages : 0)
  const stored = picksOf(actions, "languages")
  const suggested = stored.length === 0 ? (SPECIES_LANGUAGES[speciesId] ?? []) : []
  const shown = stored.length > 0 ? stored : suggested

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs">Languages{suggested.length > 0 && " · Suggested"}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Choose languages" className="focus-visible:ring-ring flex flex-wrap items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-2">
            <span className={`${CHIP} bg-muted`}>Common</span>
            {shown.map((language) => (
              <span key={language} className={`${CHIP} bg-foreground text-background border-foreground`}>{language}</span>
            ))}
            {Array.from({ length: Math.max(count - shown.length, 0) }, (_, index) => (
              <span key={index} className={`${CHIP} text-muted-foreground gap-1 border-dashed`}>
                <Plus className="size-3" />
                Language
              </span>
            ))}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <BuilderChipPicker chips={languageChips()} value={shown} count={count} label="Languages" onChange={(next) => actions.onValue("languages", next.length > 0 ? next : null)} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
