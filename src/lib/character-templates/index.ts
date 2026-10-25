import { BLADES } from "./blades"
import { DND_5E } from "./dnd-5e"
import { DND_5E_2024 } from "./dnd-5e-2024"
import { FREEFORM } from "./freeform"
import type { CharacterTemplate } from "./types"

// Every released version of every template. A new one is one more entry here.
const TEMPLATES: CharacterTemplate[] = [FREEFORM, DND_5E, DND_5E_2024, BLADES]

export const templateFor = (id: string, version: number) =>
  TEMPLATES.find((template) => template.id === id && template.version === version) ?? null

// What the New character dialog offers, in its order: the newest version of each. The
// short line is the licence in brief; the full notice is on the legal page.
export const TEMPLATE_CHOICES: { id: string; version: number; name: string; description: string; licence?: string }[] = [
  { id: FREEFORM.id, version: FREEFORM.version, name: "Freeform", description: "Start empty and add what you need." },
  {
    id: DND_5E_2024.id,
    version: DND_5E_2024.version,
    name: "D&D 5e",
    description: "Class, species and scores in; the rest worked out. 2024 rules.",
    licence: "D&D SRD 5.2.1 · CC-BY-4.0",
  },
  {
    id: BLADES.id,
    version: BLADES.version,
    name: "Blades in the Dark",
    description: "Action ratings, stress and harm.",
    licence: "Blades in the Dark SRD · CC-BY-3.0",
  },
]

export const DEFAULT_TEMPLATE_ID = FREEFORM.id

// Where a character on an old version of a template is carried to when its sheet loads:
// the newest version of the same template.
export const latestVersion = (id: string) =>
  Math.max(...TEMPLATES.filter((template) => template.id === id).map((template) => template.version))
