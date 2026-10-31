import { ARCHERY, ARCHERY_BONUS } from "./srd-5-2-1-feats"

// What a feature comes to, in a few words, for the right-hand side of a row of the builder's
// Features tab. Short and mechanical, from the same pages as the class and species summaries.

// A feature with nothing to choose, by name. PB is the Proficiency Bonus.
export const FEATURE_STATE: Record<string, string> = {
  Rage: "2 / Short Rest",
  "Second Wind": "2 / Short Rest",
  "Bardic Inspiration": "d6",
  "Lay On Hands": "5 × level HP",
  "Martial Arts": "d6",
  "Sneak Attack": "1d6",
  "Thieves’ Cant": "Thieves’ Cant",
  Druidic: "Druidic",
  "Favored Enemy": "Hunter’s Mark",
  "Innate Sorcery": "2 / Long Rest",
  "Ritual Adept": "Rituals",
  "Arcane Recovery": "Short Rest",
  "Breath Weapon": "PB / Long Rest",
  "Draconic Flight": "Level 5",
  "Dwarven Resilience": "Poison resistance",
  "Dwarven Toughness": "+1 HP / level",
  Stonecunning: "PB / Long Rest",
  "Fey Ancestry": "Adv. vs Charmed",
  Trance: "4 h Long Rest",
  "Gnomish Cunning": "Adv. on mental saves",
  "Large Form": "Level 5",
  "Powerful Build": "Grapple Adv.",
  Brave: "Adv. vs Frightened",
  Luck: "Reroll 1s",
  Resourceful: "Inspiration / Long Rest",
  "Adrenaline Rush": "PB / Short Rest",
  "Relentless Endurance": "1 / Long Rest",
  "Otherworldly Presence": "Thaumaturgy",
}

// The effect of a Fighting Style feat, shown after its name.
export const STYLE_EFFECT: Record<string, string> = {
  [ARCHERY]: `+${ARCHERY_BONUS} ranged`,
  Defense: "+1 AC",
  "Great Weapon Fighting": "Reroll 1s, 2s",
  "Two-Weapon Fighting": "+ modifier damage",
}
