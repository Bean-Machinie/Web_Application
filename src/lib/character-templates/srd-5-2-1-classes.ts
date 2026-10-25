import { ARTISAN_TOOLS, MUSICAL_INSTRUMENTS } from "./srd-5-2-1-gear"
import type { ChoiceDecl } from "./srd-5-2-1-choices"

// What the builder shows of each class, from the SRD 5.2.1: the Class Overview table (p. 19),
// the Core Traits table (the class’s first page) and its level 1 features, summarised. A
// feature that asks for a choice has it declared under `choices`.

export type ClassBuild = {
  likes: string
  complexity: "Low" | "Average" | "High"
  // Weapon Proficiencies. Martial is all, only Light ones, or only Finesse or Light ones.
  weapons: { simple: boolean; martial: false | "all" | "light" | "finesse-light" }
  armor: string
  // Tool Proficiencies that are fixed.
  tools: string[]
  features: { name: string; summary: string; page: number }[]
  choices: ChoiceDecl[]
  // More languages than the two everyone picks (Thieves’ Cant brings one).
  extraLanguages: number
  // Has spells, which the builder does not yet take.
  spellcaster: boolean
}

const f = (name: string, summary: string, page: number) => ({ name, summary, page })
const masteries = (count: number, rule: "melee" | "any" | "proficient"): ChoiceDecl => ({
  kind: "weapons",
  field: "class-masteries",
  title: "Weapon Mastery",
  count,
  rule,
})
const SPELLS = "Cast spells with your spellcasting ability. Choosing spells comes later."

export const CLASS_BUILD: Record<string, ClassBuild> = {
  barbarian: {
    likes: "Battle", complexity: "Average", weapons: { simple: true, martial: "all" }, armor: "Light and Medium armor, Shields", tools: [],
    features: [
      f("Rage", "Bonus Action: Resistance to Bludgeoning, Piercing and Slashing damage, extra Strength damage, Advantage on Strength checks and saves. 2 uses.", 28),
      f("Unarmored Defense", "Without armor, your base AC is 10 + Dexterity + Constitution. A Shield is fine.", 29),
      f("Weapon Mastery", "Use the mastery properties of 2 kinds of Simple or Martial Melee weapons.", 29),
    ],
    choices: [masteries(2, "melee")], extraLanguages: 0, spellcaster: false,
  },
  bard: {
    likes: "Performing", complexity: "High", weapons: { simple: true, martial: false }, armor: "Light armor", tools: [],
    features: [
      f("Bardic Inspiration", "Bonus Action: inspire another creature within 60 feet with a d6.", 31),
      f("Spellcasting", SPELLS, 32),
    ],
    choices: [{ kind: "tools", field: "class-tools", title: "Musical Instruments", count: 3, from: MUSICAL_INSTRUMENTS }],
    extraLanguages: 0, spellcaster: true,
  },
  cleric: {
    likes: "Gods", complexity: "Average", weapons: { simple: true, martial: false }, armor: "Light and Medium armor, Shields", tools: [],
    features: [
      f("Spellcasting", SPELLS, 36),
      f("Divine Order", "Choose Protector (Martial weapons and Heavy armor) or Thaumaturge (an extra cantrip and a bonus to Arcana and Religion).", 37),
    ],
    choices: [{
      kind: "options", field: "class-order", title: "Divine Order", count: 1,
      options: [
        { id: "protector", label: "Protector", note: "Martial weapons and Heavy armor training." },
        { id: "thaumaturge", label: "Thaumaturge", note: "One extra cantrip and a bonus to Arcana and Religion checks." },
      ],
    }],
    extraLanguages: 0, spellcaster: true,
  },
  druid: {
    likes: "Nature", complexity: "High", weapons: { simple: true, martial: false }, armor: "Light armor, Shields", tools: ["Herbalism Kit"],
    features: [
      f("Spellcasting", SPELLS, 41),
      f("Druidic", "You know Druidic, and always have Speak with Animals prepared.", 42),
      f("Primal Order", "Choose Magician (an extra cantrip and a bonus to Arcana and Nature) or Warden (Martial weapons and Medium armor).", 42),
    ],
    choices: [{
      kind: "options", field: "class-order", title: "Primal Order", count: 1,
      options: [
        { id: "magician", label: "Magician", note: "One extra cantrip and a bonus to Arcana and Nature checks." },
        { id: "warden", label: "Warden", note: "Martial weapons and Medium armor training." },
      ],
    }],
    extraLanguages: 0, spellcaster: true,
  },
  fighter: {
    likes: "Weapons", complexity: "Low", weapons: { simple: true, martial: "all" }, armor: "Light, Medium and Heavy armor, Shields", tools: [],
    features: [
      f("Fighting Style", "A Fighting Style feat of your choice. Defense is recommended.", 47),
      f("Second Wind", "Bonus Action: regain 1d10 + your Fighter level in Hit Points. 2 uses, one back on a Short Rest, all on a Long Rest.", 48),
      f("Weapon Mastery", "Use the mastery properties of 3 kinds of Simple or Martial weapons.", 48),
    ],
    choices: [{ kind: "feat", field: "class-style", title: "Fighting Style", category: "fighting-style", recommended: "Defense" }, masteries(3, "any")],
    extraLanguages: 0, spellcaster: false,
  },
  monk: {
    likes: "Unarmed combat", complexity: "High", weapons: { simple: true, martial: "light" }, armor: "None", tools: [],
    features: [
      f("Martial Arts", "Bonus Unarmed Strike, a d6 martial arts die, and Dexterity for your Unarmed Strikes and Monk weapons.", 50),
      f("Unarmored Defense", "Without armor or a Shield, your base AC is 10 + Dexterity + Wisdom.", 50),
    ],
    choices: [{ kind: "tools", field: "class-tools", title: "Tool proficiency", count: 1, from: [...ARTISAN_TOOLS, ...MUSICAL_INSTRUMENTS] }],
    extraLanguages: 0, spellcaster: false,
  },
  paladin: {
    likes: "Defense", complexity: "Average", weapons: { simple: true, martial: "all" }, armor: "Light, Medium and Heavy armor, Shields", tools: [],
    features: [
      f("Lay On Hands", "A healing pool of 5 × your Paladin level Hit Points, refilled on a Long Rest.", 53),
      f("Spellcasting", SPELLS, 54),
      f("Weapon Mastery", "Use the mastery properties of 2 kinds of weapons you are proficient with.", 54),
    ],
    choices: [masteries(2, "proficient")], extraLanguages: 0, spellcaster: true,
  },
  ranger: {
    likes: "Survival", complexity: "Average", weapons: { simple: true, martial: "all" }, armor: "Light and Medium armor, Shields", tools: [],
    features: [
      f("Spellcasting", SPELLS, 57),
      f("Favored Enemy", "Hunter’s Mark is always prepared, and you can cast it twice for free per Long Rest.", 58),
      f("Weapon Mastery", "Use the mastery properties of 2 kinds of weapons you are proficient with.", 58),
    ],
    choices: [masteries(2, "proficient")], extraLanguages: 0, spellcaster: true,
  },
  rogue: {
    likes: "Stealth", complexity: "Low", weapons: { simple: true, martial: "finesse-light" }, armor: "Light armor", tools: ["Thieves’ Tools"],
    features: [
      f("Expertise", "Double your Proficiency Bonus on 2 skills you are proficient in. Sleight of Hand and Stealth are recommended.", 61),
      f("Sneak Attack", "Once per turn, deal an extra 1d6 damage to a creature you hit.", 61),
      f("Thieves’ Cant", "You know Thieves’ Cant and one other language of your choice.", 62),
      f("Weapon Mastery", "Use the mastery properties of 2 kinds of weapons you are proficient with.", 62),
    ],
    choices: [{ kind: "expertise", field: "class-expertise", title: "Expertise", count: 2 }, masteries(2, "proficient")],
    extraLanguages: 1, spellcaster: false,
  },
  sorcerer: {
    likes: "Power", complexity: "High", weapons: { simple: true, martial: false }, armor: "None", tools: [],
    features: [
      f("Spellcasting", SPELLS, 64),
      f("Innate Sorcery", "Bonus Action, 1 minute: your spell save DC goes up by 1 and you have Advantage on Sorcerer spell attacks. 2 uses.", 65),
    ],
    choices: [], extraLanguages: 0, spellcaster: true,
  },
  warlock: {
    likes: "Occult lore", complexity: "High", weapons: { simple: true, martial: false }, armor: "Light armor", tools: [],
    features: [
      f("Eldritch Invocations", "You gain one invocation of your choice, such as Pact of the Tome.", 70),
      f("Pact Magic", SPELLS, 71),
    ],
    choices: [{
      kind: "options", field: "class-invocation", title: "Eldritch Invocation", count: 1,
      options: [
        { id: "armor-of-shadows", label: "Armor of Shadows", note: "Cast Mage Armor on yourself for free." },
        { id: "eldritch-mind", label: "Eldritch Mind", note: "Advantage on Constitution saves to keep Concentration." },
        { id: "pact-of-the-blade", label: "Pact of the Blade", note: "Conjure a pact weapon." },
        { id: "pact-of-the-chain", label: "Pact of the Chain", note: "Learn Find Familiar, with a stronger familiar." },
        { id: "pact-of-the-tome", label: "Pact of the Tome", note: "Conjure a Book of Shadows with extra cantrips." },
      ],
    }],
    extraLanguages: 0, spellcaster: true,
  },
  wizard: {
    likes: "Spellbooks", complexity: "Average", weapons: { simple: true, martial: false }, armor: "None", tools: [],
    features: [
      f("Spellcasting", SPELLS, 77),
      f("Ritual Adept", "Cast spells with the Ritual tag from your spellbook without preparing them.", 78),
      f("Arcane Recovery", "On a Short Rest, regain spell slots of a combined level up to half your Wizard level.", 78),
    ],
    choices: [], extraLanguages: 0, spellcaster: true,
  },
}
