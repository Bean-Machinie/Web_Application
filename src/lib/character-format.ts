import { ABILITIES, SKILLS } from "./character-templates/srd-5-2-1"

// How the builder and the sheet write the character's numbers and names, once.

// What shows where a value is missing.
export const NONE = "—"

// "Strength", or the id itself for one that is not an ability.
export const abilityName = (id: string) => ABILITIES.find(([ability]) => ability === id)?.[1] ?? id
// "Str".
export const abilityShort = (id: string) => abilityName(id).slice(0, 3)

// "Sleight of Hand" for a skill's id, with or without the "skill:" the Skilled feat's picks have;
// a "tool:" pick is its tool's name.
export const skillName = (id: string) => SKILLS.find(([skill]) => skill === id.replace("skill:", ""))?.[1] ?? id.replace("tool:", "")

// A bonus or modifier with its sign, as "+3" or "−1" (a true minus), and a dash while there is none.
export const signed = (value: number | null | undefined) => (value === null || value === undefined ? NONE : value >= 0 ? `+${value}` : `−${-value}`)

// "A, B and C"; "A and B"; "A". Another word than "and" can join the last two.
export const joinList = (items: string[], conjunction = "and") =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`
