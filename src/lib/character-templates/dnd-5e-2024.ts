import { backstoryFields, equipmentFields, slotFields } from "./dnd-5e-2024-builder-fields"
import {
  abilityFields,
  backgroundFields,
  combatFields,
  hitPointFields,
  identityFields,
  proficiencyFields,
  spellFields,
} from "./dnd-5e-2024-fields"
import { COINS } from "./srd-5-2-1"
import type { CharacterTemplate } from "./types"

// The D&D 5e sheet, in the terms of the System Reference Document 5.2.1 (the
// 2024 rules): the player gives class, level, species, background and scores, and the rest
// is calculated and can be written over. Structure and numbers only, no rules text.
// The licence notice is in legal-notices.ts.
export const DND_5E_2024: CharacterTemplate = {
  id: "dnd-5e",
  version: 2,
  builder: true,
  tabs: [
    { id: "overview", label: "Overview", empty: "No details yet" },
    { id: "skills", label: "Skills", empty: "No skills yet" },
    { id: "inventory", label: "Inventory", empty: "No items yet" },
    { id: "spells", label: "Spells", empty: "No spells yet" },
    { id: "notes", label: "Notes", empty: "No notes yet" },
  ],
  sections: [
    { id: "identity", tab: "overview", label: "Identity", profile: true },
    { id: "abilities", tab: "overview", label: "Ability scores", layout: "abilities", columns: 6, summary: "6 scores" },
    { id: "saving-throws", tab: "overview", label: "Saving throws", layout: "saves", columns: 2, summary: "6 saves" },
    { id: "background", tab: "overview", label: "Background benefits", builderOnly: true },
    { id: "combat", tab: "overview", label: "Combat", layout: "grid", columns: 6, summary: "Armor Class, Initiative, Speed" },
    { id: "body", tab: "overview", label: "Size and senses", layout: "grid", columns: 3, summary: "Size, Darkvision, Carrying capacity" },
    { id: "hit-points", tab: "overview", label: "Hit points", summary: "Hit Points, Hit Dice, Death Saves" },
    { id: "attacks", tab: "overview", label: "Attacks", summary: "Name, ability, to-hit, damage" },
    { id: "skills", tab: "skills", label: "Skills", columns: 2, summary: "18 skills" },
    { id: "spellcasting", tab: "spells", label: "Spellcasting", layout: "grid", columns: 3, summary: "Ability, Save DC, Attack" },
    { id: "backstory", tab: "notes", label: "Backstory", columns: 1, summary: "6 questions" },
    { id: "currency", tab: "inventory", label: "Currency", layout: "grid", columns: 5, summary: "Copper to platinum" },
  ],
  fields: [
    ...identityFields,
    ...abilityFields,
    ...backgroundFields,
    ...slotFields,
    ...equipmentFields,
    ...backstoryFields,
    ...combatFields,
    ...hitPointFields,
    { id: "attacks", tab: "overview", section: "attacks", type: "attacks", label: "Attacks" },
    ...proficiencyFields,
    ...spellFields,
    ...COINS.map(([id, label, short]) => ({ id: `coin.${id}`, tab: "inventory", section: "currency", type: "stat" as const, label: short, title: `${label} pieces` })),
    { id: "inventory", tab: "inventory", type: "list", label: "Inventory" },
    { id: "spells", tab: "spells", type: "list", label: "Spells" },
  ],
}
