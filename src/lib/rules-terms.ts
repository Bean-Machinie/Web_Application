import { campaignPath } from "./campaign-paths"
import { GLOSSARY } from "./character-templates/srd-5-2-1-glossary"
import type { GlossaryEntry } from "./character-templates/srd-5-2-1-glossary"

export type RuleTerm = { id: string; entry: GlossaryEntry }

export const RULE_TERMS: RuleTerm[] = Object.entries(GLOSSARY)
  .map(([id, entry]) => ({ id, entry }))
  .sort((a, b) => a.entry.title.localeCompare(b.entry.title))

export const ruleTerm = (id: string | undefined) => RULE_TERMS.find((term) => term.id === id)

export const rulesPath = (campaignId: string, termId?: string) => campaignPath(campaignId, termId ? `rules/${termId}` : "rules")

export function matchingTerms(query: string) {
  const text = query.trim().toLowerCase()
  return text ? RULE_TERMS.filter(({ entry }) => entry.title.toLowerCase().includes(text) || entry.what.toLowerCase().includes(text)) : RULE_TERMS
}

// The terms under the letter they start with, A to Z.
export function groupByLetter(terms: RuleTerm[]) {
  const groups: { letter: string; terms: RuleTerm[] }[] = []
  for (const term of terms) {
    const letter = term.entry.title[0].toUpperCase()
    const last = groups[groups.length - 1]
    if (last?.letter === letter) last.terms.push(term)
    else groups.push({ letter, terms: [term] })
  }
  return groups
}
