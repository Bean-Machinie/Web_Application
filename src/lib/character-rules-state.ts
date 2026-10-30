import { origins } from "./character-grants"
import type { GlossaryContext } from "./character-glossary"
import type { RuleState } from "./character-rules"
import { isQuickBuilt, readRules, readSuggested } from "./quick-state"

// The character as the rules see it: the origins, every stored value, and what was suggested.
export function ruleStateOf(context: GlossaryContext): RuleState {
  const { cls, species, background } = origins(context)
  return {
    cls: cls?.id ?? null,
    species: species?.id ?? null,
    background: background?.id ?? null,
    picks: Object.fromEntries(Object.entries(context.values).map(([field, stored]) => [field, stored.value])),
    suggested: isQuickBuilt(context.values) ? readSuggested(context.values) : null,
    rules: readRules(context.values),
  }
}
