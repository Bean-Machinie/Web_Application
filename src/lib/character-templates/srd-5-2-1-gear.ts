// Weapons, armor, tools and languages from the System Reference Document 5.2.1, with the
// page each is on. Only what the builder needs: names, numbers and flags, no rules text.

export type WeaponCategory = "simple" | "martial"

export type Weapon = {
  id: string
  label: string
  category: WeaponCategory
  ranged: boolean
  // Damage dice and type, like "1d8 slashing".
  damage: string
  finesse?: boolean
  light?: boolean
  // The mastery property it unlocks (p. 90).
  mastery: string
}

const w = (
  id: string,
  label: string,
  category: WeaponCategory,
  ranged: boolean,
  damage: string,
  mastery: string,
  flags: { finesse?: boolean; light?: boolean } = {}
): Weapon => ({ id, label, category, ranged, damage, mastery, ...flags })

// p. 91 (Weapons): damage, properties and mastery. Finesse and Light are the properties
// that decide the ability an attack uses and who is proficient.
export const WEAPONS: Weapon[] = [
  w("club", "Club", "simple", false, "1d4 bludgeoning", "Slow", { light: true }),
  w("dagger", "Dagger", "simple", false, "1d4 piercing", "Nick", { finesse: true, light: true }),
  w("greatclub", "Greatclub", "simple", false, "1d8 bludgeoning", "Push"),
  w("handaxe", "Handaxe", "simple", false, "1d6 slashing", "Vex", { light: true }),
  w("javelin", "Javelin", "simple", false, "1d6 piercing", "Slow"),
  w("light-hammer", "Light Hammer", "simple", false, "1d4 bludgeoning", "Nick", { light: true }),
  w("mace", "Mace", "simple", false, "1d6 bludgeoning", "Sap"),
  w("quarterstaff", "Quarterstaff", "simple", false, "1d6 bludgeoning", "Topple"),
  w("sickle", "Sickle", "simple", false, "1d4 slashing", "Nick", { light: true }),
  w("spear", "Spear", "simple", false, "1d6 piercing", "Sap"),
  w("dart", "Dart", "simple", true, "1d4 piercing", "Vex", { finesse: true }),
  w("light-crossbow", "Light Crossbow", "simple", true, "1d8 piercing", "Slow"),
  w("shortbow", "Shortbow", "simple", true, "1d6 piercing", "Vex"),
  w("sling", "Sling", "simple", true, "1d4 bludgeoning", "Slow"),
  w("battleaxe", "Battleaxe", "martial", false, "1d8 slashing", "Topple"),
  w("flail", "Flail", "martial", false, "1d8 bludgeoning", "Sap"),
  w("glaive", "Glaive", "martial", false, "1d10 slashing", "Graze"),
  w("greataxe", "Greataxe", "martial", false, "1d12 slashing", "Cleave"),
  w("greatsword", "Greatsword", "martial", false, "2d6 slashing", "Graze"),
  w("halberd", "Halberd", "martial", false, "1d10 slashing", "Cleave"),
  w("lance", "Lance", "martial", false, "1d10 piercing", "Topple"),
  w("longsword", "Longsword", "martial", false, "1d8 slashing", "Sap"),
  w("maul", "Maul", "martial", false, "2d6 bludgeoning", "Topple"),
  w("morningstar", "Morningstar", "martial", false, "1d8 piercing", "Sap"),
  w("pike", "Pike", "martial", false, "1d10 piercing", "Push"),
  w("rapier", "Rapier", "martial", false, "1d8 piercing", "Vex", { finesse: true }),
  w("scimitar", "Scimitar", "martial", false, "1d6 slashing", "Nick", { finesse: true, light: true }),
  w("shortsword", "Shortsword", "martial", false, "1d6 piercing", "Vex", { finesse: true, light: true }),
  w("trident", "Trident", "martial", false, "1d8 piercing", "Topple"),
  w("warhammer", "Warhammer", "martial", false, "1d8 bludgeoning", "Push"),
  w("war-pick", "War Pick", "martial", false, "1d8 piercing", "Sap"),
  w("whip", "Whip", "martial", false, "1d4 slashing", "Slow", { finesse: true }),
  w("blowgun", "Blowgun", "martial", true, "1 piercing", "Vex"),
  w("hand-crossbow", "Hand Crossbow", "martial", true, "1d6 piercing", "Vex", { light: true }),
  w("heavy-crossbow", "Heavy Crossbow", "martial", true, "1d10 piercing", "Push"),
  w("longbow", "Longbow", "martial", true, "1d8 piercing", "Slow"),
  w("musket", "Musket", "martial", true, "1d12 piercing", "Slow"),
  w("pistol", "Pistol", "martial", true, "1d10 piercing", "Vex"),
]

export const weaponById = (id: string) => WEAPONS.find((weapon) => weapon.id === id)

// p. 90 (Mastery Properties), in a few words.
export const MASTERY_NOTES: Record<string, string> = {
  Cleave: "Hit one creature, then attack a second one within 5 feet of it.",
  Graze: "On a miss, deal damage equal to your ability modifier.",
  Nick: "The Light weapon’s extra attack becomes part of the Attack action.",
  Push: "Push a Large or smaller creature you hit up to 10 feet away.",
  Sap: "The creature you hit has Disadvantage on its next attack roll.",
  Slow: "Reduce the Speed of a creature you hit by 10 feet.",
  Topple: "The creature you hit makes a Constitution save or falls Prone.",
  Vex: "Advantage on your next attack roll against the creature you hit.",
}

export type ArmorKind = "light" | "medium" | "heavy"

export type Armor = {
  id: string
  label: string
  kind: ArmorKind
  // The base AC; Dexterity is added for Light and Medium, up to 2 for Medium.
  base: number
}

// p. 92 (Armor): Light and Medium armor add Dexterity (Medium to at most of 2), Heavy armor
// is a flat number, a Shield adds 2.
export const ARMOR: Armor[] = [
  { id: "padded", label: "Padded Armor", kind: "light", base: 11 },
  { id: "leather", label: "Leather Armor", kind: "light", base: 11 },
  { id: "studded-leather", label: "Studded Leather Armor", kind: "light", base: 12 },
  { id: "hide", label: "Hide Armor", kind: "medium", base: 12 },
  { id: "chain-shirt", label: "Chain Shirt", kind: "medium", base: 13 },
  { id: "scale-mail", label: "Scale Mail", kind: "medium", base: 14 },
  { id: "breastplate", label: "Breastplate", kind: "medium", base: 14 },
  { id: "half-plate", label: "Half Plate Armor", kind: "medium", base: 15 },
  { id: "ring-mail", label: "Ring Mail", kind: "heavy", base: 14 },
  { id: "chain-mail", label: "Chain Mail", kind: "heavy", base: 16 },
  { id: "splint", label: "Splint Armor", kind: "heavy", base: 17 },
  { id: "plate", label: "Plate Armor", kind: "heavy", base: 18 },
]
export const SHIELD_AC = 2
export const MEDIUM_ARMOR_DEX_CAP = 2

// p. 93-94 (Tools): Artisan’s Tools, each its own proficiency.
export const ARTISAN_TOOLS = [
  "Alchemist’s Supplies",
  "Brewer’s Supplies",
  "Calligrapher’s Supplies",
  "Carpenter’s Tools",
  "Cartographer’s Tools",
  "Cobbler’s Tools",
  "Cook’s Utensils",
  "Glassblower’s Tools",
  "Jeweler’s Tools",
  "Leatherworker’s Tools",
  "Mason’s Tools",
  "Painter’s Supplies",
  "Potter’s Tools",
  "Smith’s Tools",
  "Tinker’s Tools",
  "Weaver’s Tools",
  "Woodcarver’s Tools",
]

// p. 94 (Tools): the other tools. Gaming sets and Musical Instruments are below.
export const OTHER_TOOLS = ["Disguise Kit", "Forgery Kit", "Herbalism Kit", "Navigator’s Tools", "Poisoner’s Kit", "Thieves’ Tools"]

// p. 94 (Gaming Set variants, Musical Instrument variants).
export const GAMING_SETS = ["Dice", "Dragonchess", "Playing cards", "Three-dragon ante"]
export const MUSICAL_INSTRUMENTS = ["Bagpipes", "Drum", "Dulcimer", "Flute", "Horn", "Lute", "Lyre", "Pan flute", "Shawm", "Viol"]

// p. 20 (Standard Languages). Every character knows Common and picks two more of the rest.
export const STANDARD_LANGUAGES = [
  "Common",
  "Common Sign Language",
  "Draconic",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Orc",
]
export const LANGUAGES_TO_PICK = 2
