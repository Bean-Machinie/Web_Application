import { RECOMMENDED_FEAT } from "./srd-5-2-1"
import { GAMING_SETS } from "./srd-5-2-1-gear"
import type { ChoiceDecl, OptionDecl } from "./srd-5-2-1-choices"

// The choices that species and backgrounds ask for, from the SRD 5.2.1: Dragonborn p. 84,
// Elf and Gnome p. 85 (Elven Lineages, Gnomish Lineage), Goliath p. 85, Human p. 86 (Skillful,
// Versatile), Tiefling p. 86 (Fiendish Legacies), the Soldier’s gaming set p. 83.

// The abilities a feat or lineage can ask for its spellcasting: Intelligence, Wisdom or Charisma.
export const ABILITY_OPTIONS: OptionDecl[] = [
  { id: "int", label: "Intelligence" },
  { id: "wis", label: "Wisdom" },
  { id: "cha", label: "Charisma" },
]
const lineageAbility: ChoiceDecl = { kind: "options", field: "species-ability", title: "Spellcasting ability", count: 1, options: ABILITY_OPTIONS }

const DRAGONS: [string, string][] = [
  ["black", "Acid"], ["blue", "Lightning"], ["brass", "Fire"], ["bronze", "Lightning"], ["copper", "Acid"],
  ["gold", "Fire"], ["green", "Poison"], ["red", "Fire"], ["silver", "Cold"], ["white", "Cold"],
]

// Elf lineages change Darkvision or Speed; the template reads these ids.
export const DROW = "drow"
export const WOOD_ELF = "wood-elf"

export const SPECIES_CHOICES: Record<string, ChoiceDecl[]> = {
  dragonborn: [{
    kind: "options", field: "species-option", title: "Draconic Ancestry", count: 1,
    options: DRAGONS.map(([dragon, damage]) => ({ id: dragon, label: `${dragon[0].toUpperCase()}${dragon.slice(1)}`, note: `${damage} damage for your Breath Weapon and Resistance.`, lineage: true, adjective: true })),
  }],
  elf: [
    {
      kind: "options", field: "species-option", title: "Elven Lineage", count: 1,
      options: [
        { id: DROW, label: "Drow", note: "Darkvision 120 ft and the Dancing Lights cantrip.", lineage: true },
        { id: "high-elf", label: "High Elf", note: "The Prestidigitation cantrip, swappable for a Wizard cantrip.", lineage: true },
        { id: WOOD_ELF, label: "Wood Elf", note: "Speed 35 ft and the Druidcraft cantrip.", lineage: true },
      ],
    },
    { kind: "skills", field: "species-skill", title: "Keen Senses", count: 1, from: ["insight", "perception", "survival"] },
    lineageAbility,
  ],
  gnome: [
    {
      kind: "options", field: "species-option", title: "Gnomish Lineage", count: 1,
      options: [
        { id: "forest-gnome", label: "Forest Gnome", note: "Minor Illusion and Speak with Animals.", lineage: true },
        { id: "rock-gnome", label: "Rock Gnome", note: "Mending, Prestidigitation and clockwork devices.", lineage: true },
      ],
    },
    lineageAbility,
  ],
  goliath: [{
    kind: "options", field: "species-option", title: "Giant Ancestry", count: 1,
    options: [
      { id: "cloud", label: "Cloud’s Jaunt", note: "Bonus Action: teleport up to 30 feet." },
      { id: "fire", label: "Fire’s Burn", note: "Extra 1d10 Fire damage on a hit." },
      { id: "frost", label: "Frost’s Chill", note: "Extra 1d6 Cold damage and −10 ft Speed on a hit." },
      { id: "hill", label: "Hill’s Tumble", note: "Knock a Large or smaller target Prone on a hit." },
      { id: "stone", label: "Stone’s Endurance", note: "Reaction: reduce damage by 1d12 + Constitution." },
      { id: "storm", label: "Storm’s Thunder", note: "Reaction: 1d8 Thunder damage to a creature within 60 feet that hurt you." },
    ],
  }],
  human: [
    { kind: "skills", field: "species-skill", title: "Skillful", count: 1, from: "any" },
    { kind: "feat", field: "species-feat", title: "Versatile", category: "origin", recommended: RECOMMENDED_FEAT },
  ],
  tiefling: [
    {
      kind: "options", field: "species-option", title: "Fiendish Legacy", count: 1,
      options: [
        { id: "abyssal", label: "Abyssal", note: "Resistance to Poison and the Poison Spray cantrip.", lineage: true, adjective: true },
        { id: "chthonic", label: "Chthonic", note: "Resistance to Necrotic and the Chill Touch cantrip.", lineage: true, adjective: true },
        { id: "infernal", label: "Infernal", note: "Resistance to Fire and the Fire Bolt cantrip.", lineage: true, adjective: true },
      ],
    },
    lineageAbility,
  ],
}

// The Soldier picks which gaming set; the other backgrounds’ tools are fixed (BACKGROUNDS).
export const BACKGROUND_CHOICES: Record<string, ChoiceDecl[]> = {
  soldier: [{ kind: "tools", field: "background-tool", title: "Gaming set", count: 1, from: GAMING_SETS }],
}

export type Trait = { name: string; summary: string; choice?: boolean }

// The traits of each species, summarised (pp. 84-86, Species Descriptions). A trait that
// asks for a choice is marked, and its choice is in SPECIES_CHOICES.
export const SPECIES_TRAIT_LIST: Record<string, Trait[]> = {
  dragonborn: [
    { name: "Draconic Ancestry", summary: "Choose a kind of dragon; it sets the damage of your Breath Weapon and your Resistance.", choice: true },
    { name: "Breath Weapon", summary: "Replace an attack with a 15-foot cone or 30-foot line of damage (Dexterity save), a Proficiency Bonus number of times per Long Rest." },
    { name: "Damage Resistance", summary: "Resistance to the damage type of your ancestry." },
    { name: "Darkvision", summary: "See in the dark up to 60 feet." },
    { name: "Draconic Flight", summary: "At level 5, spectral wings give you a Fly Speed equal to your Speed for 10 minutes." },
  ],
  dwarf: [
    { name: "Darkvision", summary: "See in the dark up to 120 feet." },
    { name: "Dwarven Resilience", summary: "Resistance to Poison damage, and Advantage on saves against being Poisoned." },
    { name: "Dwarven Toughness", summary: "Your Hit Point maximum goes up by 1, and by 1 more each level." },
    { name: "Stonecunning", summary: "Bonus Action: Tremorsense 60 feet for 10 minutes, a Proficiency Bonus number of times per Long Rest." },
  ],
  elf: [
    { name: "Darkvision", summary: "See in the dark up to 60 feet." },
    { name: "Elven Lineage", summary: "Drow, High Elf or Wood Elf: a cantrip and a bonus, with spells at levels 3 and 5.", choice: true },
    { name: "Fey Ancestry", summary: "Advantage on saves against being Charmed." },
    { name: "Keen Senses", summary: "Proficiency in Insight, Perception or Survival.", choice: true },
    { name: "Trance", summary: "You do not sleep, and a Long Rest takes 4 hours." },
  ],
  gnome: [
    { name: "Darkvision", summary: "See in the dark up to 60 feet." },
    { name: "Gnomish Cunning", summary: "Advantage on Intelligence, Wisdom and Charisma saves." },
    { name: "Gnomish Lineage", summary: "Forest Gnome or Rock Gnome, each with cantrips.", choice: true },
  ],
  goliath: [
    { name: "Giant Ancestry", summary: "Choose a giant’s boon, used a Proficiency Bonus number of times per Long Rest.", choice: true },
    { name: "Large Form", summary: "At level 5, become Large for 10 minutes." },
    { name: "Powerful Build", summary: "Advantage to end the Grappled condition, and you count as one size larger for carrying." },
  ],
  halfling: [
    { name: "Brave", summary: "Advantage on saves against being Frightened." },
    { name: "Halfling Nimbleness", summary: "Move through the space of a larger creature." },
    { name: "Luck", summary: "Reroll a 1 on the d20 of a D20 Test." },
    { name: "Naturally Stealthy", summary: "Hide when only obscured by a creature one size larger." },
  ],
  human: [
    { name: "Resourceful", summary: "You gain Heroic Inspiration whenever you finish a Long Rest." },
    { name: "Skillful", summary: "Proficiency in one skill of your choice.", choice: true },
    { name: "Versatile", summary: "An Origin feat of your choice. Skilled is recommended.", choice: true },
  ],
  orc: [
    { name: "Adrenaline Rush", summary: "Dash as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus." },
    { name: "Darkvision", summary: "See in the dark up to 120 feet." },
    { name: "Relentless Endurance", summary: "Drop to 1 Hit Point instead of 0, once per Long Rest." },
  ],
  tiefling: [
    { name: "Darkvision", summary: "See in the dark up to 60 feet." },
    { name: "Fiendish Legacy", summary: "Abyssal, Chthonic or Infernal: a Resistance and a cantrip, with spells at levels 3 and 5.", choice: true },
    { name: "Otherworldly Presence", summary: "You know the Thaumaturgy cantrip." },
  ],
}
