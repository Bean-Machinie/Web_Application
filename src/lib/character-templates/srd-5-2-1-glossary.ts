// Short explanations of what is on the sheet, summarised from the System Reference Document
// 5.2.1, each with the page it is on. Plain words, not the rules text.

export type GlossaryEntry = {
  title: string
  // What it is, in a sentence.
  what: string
  // What it is used for.
  use: string
  page: number
}

const entry = (title: string, what: string, use: string, page: number): GlossaryEntry => ({ title, what, use, page })

// p. 5 (Ability Descriptions), p. 7 (Saving Throw Examples).
const ABILITY_NOTES: [string, string, string, string][] = [
  ["str", "Strength", "physical might", "physically resist direct force"],
  ["dex", "Dexterity", "agility, reflexes and balance", "dodge out of harm’s way"],
  ["con", "Constitution", "health and stamina", "endure a toxic hazard"],
  ["int", "Intelligence", "reasoning and memory", "recognize an illusion as fake"],
  ["wis", "Wisdom", "perceptiveness and mental fortitude", "resist a mental assault"],
  ["cha", "Charisma", "confidence, poise and charm", "assert your identity"],
]

// p. 9 (Skills): the ability a skill most often goes with, and what it is for.
const SKILL_NOTES: [string, string, string][] = [
  ["acrobatics", "Dexterity", "Stay on your feet in a tricky situation, or perform an acrobatic stunt."],
  ["animal-handling", "Wisdom", "Calm or train an animal, or get it to behave a certain way."],
  ["arcana", "Intelligence", "Recall lore about spells, magic items and the planes of existence."],
  ["athletics", "Strength", "Jump farther than normal, stay afloat in rough water, or break something."],
  ["deception", "Charisma", "Tell a convincing lie, or wear a disguise convincingly."],
  ["history", "Intelligence", "Recall lore about historical events, people, nations and cultures."],
  ["insight", "Wisdom", "Discern a person’s mood and intentions."],
  ["intimidation", "Charisma", "Awe or threaten someone into doing what you want."],
  ["investigation", "Intelligence", "Find obscure information in books, or deduce how something works."],
  ["medicine", "Wisdom", "Diagnose an illness, or determine what killed the recently slain."],
  ["nature", "Intelligence", "Recall lore about terrain, plants, animals and weather."],
  ["perception", "Wisdom", "Use your senses together to notice something easy to miss."],
  ["performance", "Charisma", "Act, tell a story, perform music, or dance."],
  ["persuasion", "Charisma", "Honestly and graciously convince someone of something."],
  ["religion", "Intelligence", "Recall lore about gods, religious rituals and holy symbols."],
  ["sleight-of-hand", "Dexterity", "Pick a pocket, conceal a handheld object, or perform legerdemain."],
  ["stealth", "Dexterity", "Escape notice by moving quietly and hiding behind things."],
  ["survival", "Wisdom", "Follow tracks, forage, find a trail, or avoid natural hazards."],
]

export const GLOSSARY: Record<string, GlossaryEntry> = {
  ...Object.fromEntries(
    ABILITY_NOTES.flatMap(([id, name, measures, save]) => [
      [`ability.${id}`, entry(name, `Measures ${measures}. Each ability has a score, usually 1 to 20.`, "Its modifier is added to ability checks, saving throws and attack rolls that use it.", 5)],
      [`save.${id}`, entry(`${name} saving throw`, `A roll to ${save}.`, "Your modifier plus your Proficiency Bonus if the class makes you proficient in it.", 7)],
    ])
  ),
  ...Object.fromEntries(
    SKILL_NOTES.map(([id, ability, use]) => [
      `skill.${id}`,
      entry(id.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), `A skill that usually goes with ${ability}.`, `${use} Add your Proficiency Bonus if you are proficient.`, 9),
    ])
  ),
  "saving-throws": entry("Saving throws", "A roll to evade or resist a threat, named for the ability it uses.", "You add your Proficiency Bonus if your class makes you proficient in that save.", 7),
  modifier: entry("Ability modifier", "A number worked out from a score: subtract 10, halve, round down.", "Added to every D20 Test made with that ability.", 5),
  "proficiency-bonus": entry("Proficiency Bonus", "A bonus from training that grows with your level: +2 at level 1, up to +6.", "Added to rolls you are proficient in: skills, some saves, attacks and spell DCs.", 8),
  level: entry("Level", "How far your character has advanced, from 1 to 20.", "Sets your Proficiency Bonus, your Hit Dice and your Hit Points.", 23),
  class: entry("Class", "Your character’s vocation, talents and favoured tactics.", "Gives your Hit Die, saving throw proficiencies, skill choices and features.", 19),
  species: entry("Species", "The set of traits your character has from their ancestry.", "Gives your size, Speed and special traits.", 83),
  background: entry("Background", "Where and how your character spent the years before adventuring.", "Gives an Origin feat, two skills, a tool proficiency and ability score increases.", 83),
  alignment: entry("Alignment", "A shorthand for your character’s moral compass: good, evil or neutral, and lawful, chaotic or neutral.", "A guide for roleplaying; it has no effect on the numbers.", 21),
  "ability-increase": entry("Ability increase", "Your background lists three abilities: raise one by 2 and another by 1, or all three by 1.", "Added on top of your base scores; no score goes above 20.", 83),
  "origin-feat": entry("Origin feat", "A feat your background gives you at the start.", "Its benefits are listed in the Feats section.", 83),
  tool: entry("Tool proficiency", "One tool your background makes you proficient with.", "Add your Proficiency Bonus to checks made with it.", 83),
  versatile: entry("Versatile", "A Human trait: you gain an Origin feat of your choice.", "Skilled is recommended.", 86),
  skillful: entry("Skillful", "A Human trait: you gain proficiency in one skill of your choice.", "Counts as proficient on the Skills tab.", 86),
  ac: entry("Armor Class", "The target number for an attack roll against you.", "Without armor it is 10 plus your Dexterity modifier; armor and some features change it.", 177),
  initiative: entry("Initiative", "Your Dexterity modifier, rolled to set the order of turns in combat.", "Roll a d20 and add it; some feats add more.", 184),
  speed: entry("Speed", "The distance in feet you can move on your turn.", "Your species sets it; Dash gives extra movement equal to it.", 188),
  size: entry("Size", "How big your character is, set by their species.", "Sets how much you can carry.", 83),
  darkvision: entry("Darkvision", "Seeing in dim light as if bright, and in darkness as if dim, within a range.", "Colours in darkness show only as grey.", 180),
  "passive-perception": entry("Passive Perception", "A score for noticing things without rolling: 10 plus your Perception modifier.", "The GM uses it when you are not actively looking.", 22),
  hp: entry("Hit Points", "How much damage you can take: current Hit Points, up to your maximum.", "Damage lowers them and healing raises them; at 0 you start making Death Saving Throws.", 16),
  "hit-dice": entry("Hit Point Dice", "Dice you can spend on a Short Rest to regain Hit Points; you have one per level.", "Each one rolled adds your Constitution modifier to what you regain.", 183),
  "hit-die": entry("Hit Die", "The size of your class’s Hit Point Die.", "Sets your Hit Points at level 1 and each level after.", 22),
  "death-saves": entry("Death saves", "Rolls you make at the start of your turn at 0 Hit Points: 10 or higher succeeds.", "Three successes make you stable, three failures mean death.", 17),
  inspiration: entry("Heroic Inspiration", "A reward you can spend to reroll any die just after rolling it.", "You must use the new roll. You can only have one at a time.", 183),
  "spell-ability": entry("Spellcasting ability", "The ability your spells use; your class sets it.", "Its modifier feeds your spell save DC and spell attack bonus.", 23),
  "spell-dc": entry("Spell save DC", "The number a target must meet or beat to resist your spell: 8 plus your spellcasting modifier plus Proficiency Bonus.", "Used when a spell calls for a saving throw.", 22),
  "spell-attack": entry("Spell attack bonus", "Your spellcasting modifier plus Proficiency Bonus.", "Added to attack rolls made as part of a spell.", 22),
  "carrying-capacity": entry("Carrying capacity", "The most weight you can carry, in pounds: your Strength score times a number set by your size.", "Past it, your Speed can be no more than 5 feet.", 178),
  "feat-ability": entry("Feat spellcasting ability", "The ability a Magic Initiate feat’s spells use: Intelligence, Wisdom or Charisma, chosen when you take it.", "Feeds the spell save DC and attack bonus of that feat’s spells.", 87),
  attacks: entry("Attacks", "Your weapons and what they do.", "To hit: your ability modifier plus Proficiency Bonus if you are proficient with the weapon.", 22),
  coins: entry("Coins", "Copper, silver, electrum, gold and platinum pieces.", "Spent on gear and services.", 89),
}

// Each class’s Core Traits table (the page is the class’s first).
export const CLASS_NOTES: Record<string, { primary: string; page: number }> = {
  barbarian: { primary: "Strength", page: 28 },
  bard: { primary: "Charisma", page: 31 },
  cleric: { primary: "Wisdom", page: 36 },
  druid: { primary: "Wisdom", page: 41 },
  fighter: { primary: "Strength or Dexterity", page: 47 },
  monk: { primary: "Dexterity and Wisdom", page: 49 },
  paladin: { primary: "Strength and Charisma", page: 53 },
  ranger: { primary: "Dexterity and Wisdom", page: 57 },
  rogue: { primary: "Dexterity", page: 61 },
  sorcerer: { primary: "Charisma", page: 64 },
  warlock: { primary: "Charisma", page: 70 },
  wizard: { primary: "Intelligence", page: 77 },
}

// pp. 84-86 (Species Descriptions): the names of each species’ traits.
export const SPECIES_TRAITS: Record<string, { traits: string; page: number }> = {
  dragonborn: { traits: "Draconic Ancestry, Breath Weapon, Damage Resistance, Darkvision, Draconic Flight", page: 84 },
  dwarf: { traits: "Darkvision, Dwarven Resilience, Dwarven Toughness, Stonecunning", page: 84 },
  elf: { traits: "Darkvision, Elven Lineage, Fey Ancestry, Keen Senses, Trance", page: 84 },
  gnome: { traits: "Darkvision, Gnomish Cunning, Gnomish Lineage", page: 85 },
  goliath: { traits: "Giant Ancestry, Large Form, Powerful Build", page: 85 },
  halfling: { traits: "Brave, Halfling Nimbleness, Luck, Naturally Stealthy", page: 86 },
  human: { traits: "Resourceful, Skillful, Versatile", page: 86 },
  orc: { traits: "Adrenaline Rush, Darkvision, Relentless Endurance", page: 86 },
  tiefling: { traits: "Darkvision, Fiendish Legacy, Otherworldly Presence", page: 86 },
}
