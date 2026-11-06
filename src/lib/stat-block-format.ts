import { joinList, signed } from "./character-format"
import type { Senses, Speed, StatBlock } from "./stat-block-types"

const feet = (value: number) => `${value} ft.`
const number = (value: number) => value.toLocaleString("en-US")

const MOVES: [keyof Speed, string][] = [["burrow", "Burrow"], ["climb", "Climb"], ["fly", "Fly"], ["swim", "Swim"]]

export function speedText(speed: Speed) {
  const others = MOVES.filter(([key]) => speed[key] !== undefined).map(([key, label]) => `${label} ${feet(speed[key]!)}`)
  return [feet(speed.walk ?? 0), ...others].join(", ")
}

const SENSES: [keyof Senses, string][] = [["blindsight", "Blindsight"], ["darkvision", "Darkvision"], ["tremorsense", "Tremorsense"], ["truesight", "Truesight"]]

export function sensesText(senses: Senses) {
  const ranged = SENSES.filter(([key]) => senses[key] !== undefined).map(([key, label]) => `${label} ${feet(senses[key]!)}`)
  return `${ranged.join(", ")}${ranged.length ? "; " : ""}Passive Perception ${senses.passivePerception}`
}

export function crText({ value, xp, xpInLair, proficiencyBonus }: StatBlock["cr"]) {
  const lair = xpInLair ? `, or ${number(xpInLair)} in lair` : ""
  return `${value} (XP ${number(xp)}${lair}; PB ${signed(proficiencyBonus)})`
}

// "Small Fey (Goblinoid), Chaotic Neutral".
export function identityText({ size, type, tags, alignment }: StatBlock) {
  return `${joinList(size, "or")} ${type}${tags.length ? ` (${tags.join(", ")})` : ""}, ${alignment}`
}

export function immunitiesText({ damage, conditions }: StatBlock["immunities"]) {
  return [damage.join(", "), conditions.join(", ")].filter(Boolean).join("; ")
}

// The label lines under the abilities; a line with nothing to say is left out.
export function labelLines(block: StatBlock): [label: string, text: string][] {
  const lines: [string, string][] = [
    ["Skills", block.skills.map((skill) => `${skill.name} ${signed(skill.bonus)}`).join(", ")],
    ["Vulnerabilities", block.vulnerabilities.join(", ")],
    ["Resistances", block.resistances.join(", ")],
    ["Immunities", immunitiesText(block.immunities)],
    ["Gear", block.gear.join(", ")],
    ["Senses", sensesText(block.senses)],
    ["Languages", block.languages],
    ["CR", crText(block.cr)],
  ]
  return lines.filter(([, text]) => text !== "")
}

// "Fire, Cold" typed into a box is a list again.
export const parseList = (text: string) => text.split(",").map((item) => item.trim()).filter(Boolean)

// "Stealth +6, Perception +4"; a part with no number is left out.
export function parseSkills(text: string) {
  return parseList(text).flatMap((part) => {
    const found = part.match(/^(.+?)\s*([+\-−]\d+)$/)
    return found ? [{ name: found[1], bonus: Number(found[2].replace("−", "-")) }] : []
  })
}

export const skillsText = (skills: StatBlock["skills"]) => skills.map((skill) => `${skill.name} ${signed(skill.bonus)}`).join(", ")
