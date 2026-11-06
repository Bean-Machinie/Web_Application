// The standard for every creature in the app: the shape of src/data/srd-monsters.json, minus what
// names it (id, name, source), which belongs to the compendium or the entry that holds the block.

import type { AbilityId } from "./character-templates/srd-5-2-1"

export type AbilityScore = { score: number; mod: number; save: number }

export type Damage = { average: number; dice: string; type: string }

export type Attack = {
  kind: string
  bonus: number
  bonusNote?: string
  reach?: number
  range?: number[]
  onHit: string
  damage: Damage[]
}

export type Save = {
  ability: AbilityId
  dc: number
  onFailure: string
  onSuccess?: string
  targets?: string
  damage: Damage[]
}

export type Spellcasting = {
  ability: AbilityId
  saveDc?: number
  attackBonus?: number
  intro: string
  groups: { frequency: string; spells: string[] }[]
}

export type StatAction = {
  name: string
  text: string
  usage?: string
  attack?: Attack
  save?: Save
  spellcasting?: Spellcasting
}

export type Speed = { walk?: number; burrow?: number; climb?: number; fly?: number; swim?: number }

export type Senses = {
  blindsight?: number
  darkvision?: number
  tremorsense?: number
  truesight?: number
  passivePerception: number
}

export type StatBlock = {
  size: string[]
  type: string
  tags: string[]
  alignment: string
  ac: number
  initiative: { modifier: number; score: number }
  hp: { average: number; formula: string }
  speed: Speed
  abilities: Record<AbilityId, AbilityScore>
  skills: { name: string; bonus: number }[]
  vulnerabilities: string[]
  resistances: string[]
  immunities: { damage: string[]; conditions: string[] }
  gear: string[]
  senses: Senses
  languages: string
  cr: { value: string; xp: number; xpInLair?: number; proficiencyBonus: number }
  traits: StatAction[]
  actions: StatAction[]
  bonusActions: StatAction[]
  reactions: StatAction[]
  legendaryActions: { uses: number; usesInLair?: number; intro: string; actions: StatAction[] } | null
}
