import { RULE_ENTRIES } from "./rules-terms"

// Titles that are also everyday words. These link only when written with their capital ("Help",
// not "help"); every other title links in any case. Add or remove a title here to change it.
// Every entry tagged Action is treated the same way.
export const CAPITALISED_ONLY = [
  "Action", "Reaction", "Save", "Skill", "Spell", "Size", "Speed", "Reach", "Target", "Object",
  "Creature", "Monster", "Ally", "Enemy", "Weapon", "Damage", "Healing", "Hazard", "Condition",
  "Dead", "Stable", "Adventure", "Campaign", "Encounter",
  // Area shapes
  "Cone", "Cube", "Cylinder", "Emanation", "Line", "Sphere",
  // Movement and hazards named by what happens
  "Climbing", "Crawling", "Flying", "Jumping", "Swimming", "Falling", "Burning",
]

const capitalisedOnly = new Set(CAPITALISED_ONLY.map((title) => title.toLowerCase()))
const mustBeCapitalised = (entry: (typeof RULE_ENTRIES)[number]) => entry.tag === "Action" || capitalisedOnly.has(entry.title.toLowerCase())

const BY_TITLE = new Map(RULE_ENTRIES.map((entry) => [entry.title.toLowerCase(), entry.id]))

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
// "cantrip" as a pattern that takes either case of every letter.
const anyCase = (text: string) => text.replace(/[a-z]/gi, (letter) => `[${letter.toLowerCase()}${letter.toUpperCase()}]`)

// Simple plurals and possessives: cantrips, spells', Hit Points’.
const ENDINGS = ["’s", "'s", "s’", "s'", "’", "'", "es", "s"]
const ENDING = `(?:${ENDINGS.map(escape).join("|")})?`

// Longest first, so "Death Saving Throw" wins over "Saving Throw".
const patterns = [...RULE_ENTRIES]
  .sort((a, b) => b.title.length - a.title.length)
  .map((entry) => (mustBeCapitalised(entry) ? escape(entry.title) : anyCase(escape(entry.title))))

// Whole words only.
export const GLOSSARY_TERMS = new RegExp(`(?<![\\p{L}\\p{N}])(?:${patterns.join("|")})${ENDING}(?![\\p{L}\\p{N}])`, "gu")

// The entry a matched word belongs to, whatever its case or ending.
export function glossaryIdFor(word: string) {
  const text = word.toLowerCase()
  const whole = BY_TITLE.get(text)
  if (whole) return whole
  for (const ending of ENDINGS) {
    if (!text.endsWith(ending)) continue
    const id = BY_TITLE.get(text.slice(0, -ending.length))
    if (id) return id
  }
  return undefined
}
