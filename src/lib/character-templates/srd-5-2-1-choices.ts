import type { FeatCategory } from "./srd-5-2-1-feats"

// What a class, background or species lets the player choose, declared in its own data so
// the Skills and feats step shows whatever applies to the character. Each choice is stored
// as a list of ids under the field it names.

// `lineage` marks an option the sentence asks for. It stands in for the species word (High Elf,
// Forest Gnome), or with `adjective` leads it (Gold Dragonborn, Infernal Tiefling).
export type OptionDecl = { id: string; label: string; note?: string; lineage?: boolean; adjective?: boolean }

export type ChoiceDecl =
  // Skills, from a list or from any.
  | { kind: "skills"; field: string; title: string; count: number; from: string[] | "any" }
  // A feat of a category.
  | { kind: "feat"; field: string; title: string; category: FeatCategory; recommended?: string }
  // Kinds of weapons whose mastery property is used.
  | { kind: "weapons"; field: string; title: string; count: number; rule: "melee" | "any" | "proficient" }
  // Skills from those the character is proficient in.
  | { kind: "expertise"; field: string; title: string; count: number }
  // Options named by the SRD, like an order, an ancestry or a lineage.
  | { kind: "options"; field: string; title: string; count: number; options: OptionDecl[] }
  // Tools, from a list.
  | { kind: "tools"; field: string; title: string; count: number; from: string[] }
  // Skills or tools of any kind, as the Skilled feat gives (p. 87).
  | { kind: "skilled"; field: string; title: string; count: number }
  // Languages from the Standard Languages table (p. 20).
  | { kind: "languages"; field: string; title: string; count: number }

// A Kit is one of the equipment options a class or background offers (p. 20 and each
// class’s Core Traits table, p. 83 for backgrounds).
export type KitItem = {
  name: string
  qty?: number
  weapon?: string
  armor?: string
  shield?: boolean
  // Stands for a tool the player chose: the field it is stored in.
  chosenTool?: string
}

export type Kit = { id: string; label: string; gp: number; items: KitItem[] }
