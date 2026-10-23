import { countStarted } from "./formulas"
import type { CharacterTemplate, TemplateField, TemplateSection } from "./types"

// Structure only, in the terms of the Blades in the Dark SRD: no playbook abilities or
// other rules text.
const ATTRIBUTION =
  "This work is based on Blades in the Dark (found at http://www.bladesinthedark.com/), product of One Seven Design, developed and authored by John Harper, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/)."

const ATTRIBUTES: [id: string, label: string, actions: [string, string][]][] = [
  ["insight", "Insight", [["hunt", "Hunt"], ["study", "Study"], ["survey", "Survey"], ["tinker", "Tinker"]]],
  ["prowess", "Prowess", [["finesse", "Finesse"], ["prowl", "Prowl"], ["skirmish", "Skirmish"], ["wreck", "Wreck"]]],
  ["resolve", "Resolve", [["attune", "Attune"], ["command", "Command"], ["consort", "Consort"], ["sway", "Sway"]]],
]

const overview = (id: string, section: string, type: TemplateField["type"], label: string, extra: Partial<TemplateField> = {}): TemplateField => ({
  id,
  tab: "overview",
  section,
  type,
  label,
  ...extra,
})

// The four actions of an attribute as tiles, then its rating (how many actions have a
// dot) and its experience track.
const attributeSections: TemplateSection[] = ATTRIBUTES.map(([id, label]) => ({
  id,
  tab: "actions",
  label,
  layout: "grid",
  columns: 3,
  summary: "4 actions",
}))

const attributeFields = ATTRIBUTES.flatMap(([id, label, actions]): TemplateField[] => [
  ...actions.map(([action, actionLabel]): TemplateField => ({
    id: action,
    tab: "actions",
    section: id,
    type: "track",
    label: actionLabel,
    config: { length: 4 },
  })),
  {
    id: `${id}.rating`,
    tab: "actions",
    section: id,
    type: "stat",
    label: `${label} rating`,
    derived: countStarted(actions.map(([action]) => action)),
  },
  { id: `${id}.xp`, tab: "actions", section: id, type: "track", label: `${label} XP`, config: { length: 6 } },
])

export const BLADES: CharacterTemplate = {
  id: "blades-in-the-dark",
  version: 1,
  attribution: ATTRIBUTION,
  tabs: [
    { id: "overview", label: "Overview", empty: "No details yet" },
    { id: "actions", label: "Actions", empty: "No actions yet" },
    { id: "gear", label: "Gear", empty: "No gear yet" },
    { id: "stash", label: "Coin & stash", empty: "No coin yet" },
    { id: "notes", label: "Notes", empty: "No notes yet" },
  ],
  sections: [
    { id: "identity", tab: "overview", label: "Identity", profile: true },
    { id: "stress", tab: "overview", label: "Stress & trauma", summary: "Stress, trauma" },
    { id: "harm", tab: "overview", label: "Harm", summary: "3 levels" },
    { id: "armor", tab: "overview", label: "Armor", summary: "3 kinds" },
    ...attributeSections,
    { id: "playbook-xp", tab: "actions", label: "Playbook XP", summary: "1 track" },
  ],
  fields: [
    overview("playbook", "identity", "line", "Playbook"),
    overview("heritage", "identity", "line", "Heritage"),
    overview("background", "identity", "line", "Background"),
    overview("vice", "identity", "line", "Vice"),
    overview("stress", "stress", "track", "Stress", { config: { length: 9 }, pinned: true }),
    overview("trauma", "stress", "track", "Trauma", { config: { length: 4 } }),
    overview("trauma.conditions", "stress", "list", "Trauma conditions"),
    overview("harm.3", "harm", "list", "Level 3: Need help"),
    overview("harm.2", "harm", "list", "Level 2: -1d"),
    overview("harm.1", "harm", "list", "Level 1: Less effect"),
    overview("armor", "armor", "toggle", "Armor"),
    overview("armor.heavy", "armor", "toggle", "Heavy"),
    overview("armor.special", "armor", "toggle", "Special"),
    ...attributeFields,
    { id: "playbook.xp", tab: "actions", section: "playbook-xp", type: "track", label: "Playbook XP", config: { length: 8 } },
    { id: "gear", tab: "gear", type: "list", label: "Gear" },
    { id: "coin", tab: "stash", type: "stat", label: "Coin" },
    { id: "stash", tab: "stash", type: "stat", label: "Stash" },
  ],
}
