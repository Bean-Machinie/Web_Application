import type { CharacterTemplate } from "./types"

// Nothing predefined: four tabs, and whatever the player adds to them.
export const FREEFORM: CharacterTemplate = {
  id: "freeform",
  version: 1,
  tabs: [
    { id: "overview", label: "Overview", empty: "No details yet" },
    { id: "abilities", label: "Abilities", empty: "No abilities yet" },
    { id: "inventory", label: "Inventory", empty: "No items yet" },
    { id: "notes", label: "Notes", empty: "No notes yet" },
  ],
  sections: [],
  fields: [],
}
