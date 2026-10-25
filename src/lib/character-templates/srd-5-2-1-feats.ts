// Feats from the System Reference Document 5.2.1, with the page each is on.

export type FeatCategory = "origin" | "fighting-style"

export type Feat = {
  id: string
  label: string
  category: FeatCategory
  // What it gives, in a sentence.
  benefit: string
  // The SRD marks it Repeatable: it can be taken more than once (p. 87, Parts of a Feat).
  repeatable?: boolean
  // Magic Initiate: taken once for each spell list, so each time with a different one.
  spellList?: "Cleric" | "Druid" | "Wizard"
  page: number
}

const MAGIC_INITIATE = "Two cantrips and one level 1 spell from the {list} list; the spell is cast once for free per Long Rest."

// pp. 87-88 (Origin Feats, Fighting Style Feats).
export const FEATS: Feat[] = [
  { id: "Alert", label: "Alert", category: "origin", benefit: "Add your Proficiency Bonus to Initiative, and swap Initiative with a willing ally.", page: 87 },
  ...(["Cleric", "Druid", "Wizard"] as const).map((list) => ({
    id: `Magic Initiate (${list})`,
    label: `Magic Initiate (${list})`,
    category: "origin" as const,
    benefit: MAGIC_INITIATE.replace("{list}", list),
    repeatable: true,
    spellList: list,
    page: 87,
  })),
  { id: "Savage Attacker", label: "Savage Attacker", category: "origin", benefit: "Once per turn when you hit with a weapon, roll its damage dice twice and use either roll.", page: 87 },
  { id: "Skilled", label: "Skilled", category: "origin", benefit: "Proficiency in any three skills or tools of your choice.", repeatable: true, page: 87 },
  { id: "Archery", label: "Archery", category: "fighting-style", benefit: "+2 to attack rolls with Ranged weapons.", page: 87 },
  { id: "Defense", label: "Defense", category: "fighting-style", benefit: "+1 to Armor Class while wearing armor.", page: 88 },
  { id: "Great Weapon Fighting", label: "Great Weapon Fighting", category: "fighting-style", benefit: "With a two-handed melee weapon, treat 1s and 2s on damage dice as 3s.", page: 88 },
  { id: "Two-Weapon Fighting", label: "Two-Weapon Fighting", category: "fighting-style", benefit: "Add your ability modifier to the damage of your extra Light-weapon attack.", page: 88 },
]

export const featById = (id: string) => FEATS.find((feat) => feat.id === id)
export const featsOf = (category: FeatCategory) => FEATS.filter((feat) => feat.category === category)

// p. 87 (Magic Initiate): Intelligence, Wisdom or Charisma is its spellcasting ability.
export const isMagicInitiate = (id: string) => featById(id)?.spellList !== undefined
