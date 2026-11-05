import { GLOSSARY } from "./character-templates/srd-5-2-1-glossary"

const BY_TERM = new Map<string, { id: string; entry: (typeof GLOSSARY)[string] }>()
for (const [id, entry] of Object.entries(GLOSSARY)) BY_TERM.set(entry.title.toLowerCase(), { id, entry })

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Longest first, so "Armor Class" wins over anything shorter that starts the same way.
const terms = [...BY_TERM.keys()].sort((a, b) => b.length - a.length).map(escape)

// Whole words only; the character's own numbers are not part of this lookup.
export const GLOSSARY_TERMS = new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.join("|")})(?![\\p{L}\\p{N}])`, "giu")

export const glossaryEntryFor = (term: string) => BY_TERM.get(term.toLowerCase())?.entry
export const glossaryIdFor = (term: string) => BY_TERM.get(term.toLowerCase())?.id
