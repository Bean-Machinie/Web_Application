import { APPROACH_FIELD } from "./quick-state"

// How a field reads in the notes, for one and for several.
export const NOUN: Record<string, [string, string]> = {
  "class-skills": ["skill", "skills"], "species-skill": ["skill", "skills"], "skilled-picks": ["Skilled pick", "Skilled picks"],
  "class-tools": ["tool", "tools"], "class-masteries": ["weapon mastery", "weapon masteries"], "class-expertise": ["Expertise skill", "Expertise skills"],
  "species-feat": ["feat", "feats"], "ability-increase": ["ability increase", "ability increases"],
}
export const NAME: Record<string, string> = {
  "class-style": "Fighting Style", "class-order": "Order", "class-invocation": "Invocation", "background-tool": "Gaming set", "species-ability": "Spellcasting ability",
  "species-feat.ability": "Spellcasting ability", "origin-feat.ability": "Spellcasting ability", "equipment-class": "Class equipment", "equipment-background": "Background equipment",
  [APPROACH_FIELD]: "Fighting approach", ...Object.fromEntries(Object.entries(NOUN).map(([field, [one]]) => [field, one])),
}
// Cleared without a note: the sentence shows the open slot.
export const SILENT = ["species-option", "size", APPROACH_FIELD]
export const PICKS = ["class-skills", "class-style", "class-masteries", "class-expertise", "class-order", "class-invocation", "class-tools", "species-option", "species-skill", "species-ability", "species-feat", "background-tool"]
export const SCORES = ["str", "dex", "con", "int", "wis", "cha"]

