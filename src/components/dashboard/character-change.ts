import { toast } from "sonner"
import { reconcile } from "@/lib/character-rules"
import type { RuleChange } from "@/lib/character-rules"
import { ruleStateOf } from "@/lib/character-rules-state"
import { readPicks } from "@/lib/character-values"
import { KITS_FIELD, SUGGESTED_FIELD } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { kitById } from "@/lib/character-templates/srd-5-2-1-kits"
import { applyKits, chosenKits, kitsEdited } from "./character-kits"

// What a change of class, species, lineage, background or approach does to the character, from
// reconcile: the picks and suggestions it works out are stored, the starting equipment is written
// again from both kits, and a toast says what was removed or must be picked again, with Undo.

const ORIGINS = ["character-class", "species-choice", "background-choice"]
// What names the items of the kits, or picks them.
const KIT_FIELDS = ["equipment-class", "equipment-background", "class-tools", "background-tool"]
const EQUIPMENT = ["inventory", "attacks", "coin.gp", KITS_FIELD]

// `title` opens the toast: "Changed to Wizard". The toast is for what was removed or must be picked
// again; with `always` it is there with Undo even when nothing was, as for a reset.
export function changeCharacter(actions: SheetActions, change: RuleChange, title: string, always = false) {
  const result = reconcile(ruleStateOf(actions), change)
  const fields = Object.keys(result.set).sort((a, b) => Number(ORIGINS.includes(b)) - Number(ORIGINS.includes(a)))
  const before = [...fields, ...EQUIPMENT, SUGGESTED_FIELD].map((field) => [field, actions.values[field]?.value ?? null] as const)

  // The kits are written again when either changed, but not over what the player edited.
  const kits = [kitById(result.kits.cls), kitById(result.kits.background)].filter((kit): kit is NonNullable<typeof kit> => kit !== null)
  const hadKits = Object.values(chosenKits(actions)).some((kit) => kit !== null)
  const kitsChanged = KIT_FIELDS.some((field) => field in result.set) || !!change.cls || !!change.background
  const rewrite = kitsChanged && (kits.length > 0 || hadKits)
  const edited = rewrite && kitsEdited(actions)

  for (const field of fields) actions.onValue(field, result.set[field])
  const derived = result.modifiers ? { ...actions.derived, "str.mod": result.modifiers.str, "dex.mod": result.modifiers.dex } : actions.derived
  const tools = readPicks("background-tool" in result.set ? result.set["background-tool"] : actions.values["background-tool"]?.value)
  const writeKits = () => applyKits({ ...actions, derived }, kits, { "background-tool": tools }, change.cls)
  if (rewrite && !edited) writeKits()
  if (result.suggested) actions.onValue(SUGGESTED_FIELD, result.suggested)

  const notes = [...result.removed, ...(result.reopened.length > 0 ? [`${result.reopened.join(", ")} to re-pick`] : [])]
  if (notes.length > 0 || always) {
    const undo = () => {
      for (const [field, value] of before) if (field !== SUGGESTED_FIELD) actions.onValue(field, value)
      actions.onValue(SUGGESTED_FIELD, before.find(([field]) => field === SUGGESTED_FIELD)?.[1])
    }
    toast(notes.length > 0 ? `${title}: ${notes.join(", ")}` : title, { action: { label: "Undo", onClick: undo } })
  }
  if (edited) toast("Replace starting equipment?", { description: "You changed the equipment the kits gave.", action: { label: "Replace", onClick: writeKits } })
}
