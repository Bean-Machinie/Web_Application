import type { GlossaryContext } from "./character-glossary"
import { chosenOption, origins } from "./character-grants"
import { BACKGROUND_KITS, CLASS_KITS } from "./character-templates/srd-5-2-1-kits"
import { readAttacks, readList, readStat } from "./character-values"
import { differsFromSuggested } from "./character-rules"
import type { RuleState } from "./character-rules"
import { ruleStateOf } from "./character-rules-state"
import { NONE, number, signed } from "./quick-card-format"
import { readSuggested } from "./quick-state"

export type GearModel = {
  // `field` is where the kit is stored, and `resettable` that it is the player's own and not the suggestion.
  kits: { source: string; choice: string; field: string; resettable: boolean }[]
  inventory: string[]
  gold: string
  attacks: { name: string; hit: string; damage: string }[]
}

const KITS = [...Object.values(CLASS_KITS), ...Object.values(BACKGROUND_KITS)].flat()

// "Kit A", or "50 gp instead" for the gold option, for the class or background it comes from.
function kitOf(state: RuleState, suggested: string[], source: string | undefined, id: string | undefined, field: string) {
  const kit = KITS.find((candidate) => candidate.id === id)
  if (!source || !kit) return null
  return { source, choice: kit.label === "Gold" ? `${kit.gp} gp instead` : `Kit ${kit.label}`, field, resettable: state.picks[field] != null && !suggested.includes(field) && differsFromSuggested(state, field) }
}

// What the sheet's Attacks would show: the to-hit worked out as the sheet does, and the
// modifier added to the damage of an attack the builder wrote.
function attacksOf({ values, derived }: GlossaryContext) {
  const bonus = derived["proficiency-bonus"] ?? null
  return readAttacks(values.attacks?.value).map((attack) => {
    const modifier = attack.ability ? (derived[`${attack.ability}.mod`] ?? null) : null
    const worked = modifier === null || (attack.proficient && bonus === null) ? null : modifier + (attack.proficient ? bonus! : 0)
    const extra = attack.auto && modifier !== null ? ` ${modifier >= 0 ? "+" : "−"} ${Math.abs(modifier)}` : ""
    return { name: attack.name, hit: signed(attack.toHit ?? worked), damage: `${attack.damage}${extra}` }
  })
}

export function gearOf(context: GlossaryContext): GearModel {
  const { cls, background } = origins(context)
  const state = ruleStateOf(context)
  const suggested = readSuggested(context.values)
  const gold = readStat(context.values["coin.gp"]?.value)
  return {
    kits: [kitOf(state, suggested, cls?.label, chosenOption(context, "equipment-class")?.id, "equipment-class"), kitOf(state, suggested, background?.label, chosenOption(context, "equipment-background")?.id, "equipment-background")].filter((kit) => kit !== null),
    inventory: readList(context.values.inventory?.value).map((item) => item.text),
    gold: gold === null ? NONE : number(gold, " gp"),
    attacks: attacksOf(context),
  }
}
