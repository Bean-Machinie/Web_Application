import { RULE_ENTRIES } from "./rules-terms"

const BY_TITLE = new Map(RULE_ENTRIES.map((entry) => [entry.title, entry.id]))

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Longest first, so "Death Saving Throw" wins over "Saving Throw".
const titles = [...BY_TITLE.keys()].sort((a, b) => b.length - a.length).map(escape)

// The titles as the SRD writes them: capitalised, whole words, case matters.
export const GLOSSARY_TERMS = new RegExp(`(?<![\\p{L}\\p{N}])(?:${titles.join("|")})(?![\\p{L}\\p{N}])`, "gu")

export const glossaryIdFor = (term: string) => BY_TITLE.get(term)
