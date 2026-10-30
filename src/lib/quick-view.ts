import { origins, picksOf } from "./character-grants"
import type { GlossaryContext } from "./character-glossary"
import { LANGUAGES_TO_PICK } from "./character-templates/srd-5-2-1-gear"
import { CLASS_BUILD } from "./character-templates/srd-5-2-1-classes"
import { SPECIES_LANGUAGES } from "./character-templates/srd-5-2-1-quick"
import { APPROACH_FIELD } from "./quick-state"

// The choices of the start page as plain ids, so a hovered option can be tried on a copy
// before anything is stored.
export type QuickView = {
  cls: string | null
  species: string | null
  background: string | null
  approach: string | null
  lineage: string | null
  size: string | null
  languages: string[]
}

export function readView(context: GlossaryContext): QuickView {
  const { cls, species, background } = origins(context)
  return {
    cls: cls?.id ?? null,
    species: species?.id ?? null,
    background: background?.id ?? null,
    approach: (context.values[APPROACH_FIELD]?.value as string | null | undefined) ?? null,
    lineage: picksOf(context, "species-option")[0] ?? null,
    size: (context.values.size?.value as string | null | undefined) ?? null,
    languages: picksOf(context, "languages"),
  }
}

// What the player already picked, which the plan does not suggest again.
export const fixedOf = (view: QuickView): Record<string, unknown> => ({
  ...(view.size ? { size: view.size } : {}),
  ...(view.lineage ? { "species-option": [view.lineage] } : {}),
})

// The languages picked, or the one the species is tied to until the player picks.
export const shownLanguages = (view: QuickView) => (view.languages.length > 0 ? view.languages : (SPECIES_LANGUAGES[view.species ?? ""] ?? []))

export const languageCount = (view: QuickView) => LANGUAGES_TO_PICK + (view.cls ? CLASS_BUILD[view.cls].extraLanguages : 0)

// The view with one slot set to an option. A new species drops what the old one asked for.
export function withPick(view: QuickView, slot: string, id: string): QuickView {
  if (slot === "class") return { ...view, cls: id }
  if (slot === "species") return { ...view, species: id, lineage: null, size: null }
  if (slot === "background") return { ...view, background: id }
  if (slot === "approach") return { ...view, approach: id }
  if (slot === "lineage") return { ...view, lineage: id }
  if (slot === "size") return { ...view, size: id }
  const at = Number(slot.replace("language-", ""))
  const shown = shownLanguages(view)
  return { ...view, languages: Array.from({ length: languageCount(view) }, (_, index) => (index === at ? id : shown[index])).filter(Boolean) }
}
