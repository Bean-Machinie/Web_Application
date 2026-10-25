import { cardsFor, pendingCards } from "./character-cards"
import type { Derived } from "./character-derive"
import { chosenOption, origins } from "./character-grants"
import type { SheetField } from "./character-sheet"
import { ABILITIES } from "./character-templates/srd-5-2-1"
import { readLine, readStat } from "./character-values"
import { UNTITLED_CHARACTER } from "./characters"
import type { Character, StoredValue } from "./characters"

export type BuilderStep = "class" | "background" | "species" | "abilities" | "choices" | "equipment" | "details"

export const BUILDER_STEPS: { id: BuilderStep; label: string }[] = [
  { id: "class", label: "Class" },
  { id: "background", label: "Background" },
  { id: "species", label: "Species" },
  { id: "abilities", label: "Abilities" },
  { id: "choices", label: "Skills and feats" },
  { id: "equipment", label: "Equipment" },
  { id: "details", label: "Details" },
]

// Whether a step is finished, and the line under it in the stepper.
export type StepProgress = { done: boolean; summary: string }

type Sheet = { character: Character; fields: SheetField[]; values: Record<string, StoredValue>; derived: Derived }

export function builderProgress({ character, fields, values, derived }: Sheet): Record<BuilderStep, StepProgress> {
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls, background, species } = origins(context)
  const level = readStat(values.level?.value)
  const set = ABILITIES.filter(([id]) => readStat(values[id]?.value) !== null)
  const strongest = set
    .map(([id]) => ({ id, total: derived[`${id}.total`] ?? 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 2)
    .map(({ id, total }) => `${id[0].toUpperCase()}${id.slice(1)} ${total}`)
  const cards = cardsFor(context)
  const pending = pendingCards(cards)
  const originDone = !!(cls && background && species)
  const kits = ["equipment-class", "equipment-background"].map((id) => chosenOption(context, id))
  const named = character.name !== UNTITLED_CHARACTER

  return {
    class: { done: !!cls, summary: cls ? `${cls.label} ${level ?? ""}`.trim() : "Not chosen" },
    background: { done: !!background, summary: background?.label ?? "Not chosen" },
    species: { done: !!species && (!species.sizeChoice || !!chosenOption(context, "size")), summary: species?.label ?? "Not chosen" },
    abilities: {
      done: set.length === ABILITIES.length,
      summary: set.length === ABILITIES.length ? strongest.join(" · ") : set.length > 0 ? `${set.length} of ${ABILITIES.length} set` : "27 points to spend",
    },
    choices: {
      done: originDone && pending.length === 0,
      summary: !originDone ? "After origin" : pending.length === 0 ? "All chosen" : `${cards.length - pending.length} of ${cards.length} done`,
    },
    equipment: {
      done: kits.every(Boolean),
      summary: kits.every(Boolean) ? `Kits ${kits.map((kit) => kit!.label.replace("Kit ", "")).join(" and ")}` : "Not chosen",
    },
    details: { done: named && readLine(values.alignment?.value) !== "", summary: named ? character.name : "Name, alignment" },
  }
}

// The first step that must be finished for the sheet to work.
export function firstUnfinished(progress: Record<BuilderStep, StepProgress>) {
  return BUILDER_STEPS.slice(0, 4).find((step) => !progress[step.id].done) ?? null
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// What is left to choose, for the panel: the origin, the scores, each choice that is not
// finished, the equipment, the name and the alignment.
export function stillToChoose({ character, fields, values, derived }: Sheet): string[] {
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls, background, species } = origins(context)
  const left: string[] = []
  if (!cls) left.push("Class")
  if (!background) left.push("Background")
  if (!species) left.push("Species")
  else if (species.sizeChoice && !chosenOption(context, "size")) left.push("Size")
  if (ABILITIES.some(([id]) => readStat(values[id]?.value) === null)) left.push("Ability scores")
  for (const card of pendingCards(cardsFor(context))) {
    const { decl, source, remaining } = card
    if (decl.kind === "skills") left.push(plural(remaining, `${source} skill`, `${source} skills`))
    else if (decl.kind === "weapons") left.push(plural(remaining, "weapon mastery", "weapon masteries"))
    else if (decl.kind === "languages") left.push(plural(remaining, "language", "languages"))
    else if (decl.kind === "expertise") left.push(plural(remaining, "Expertise skill", "Expertise skills"))
    else left.push(decl.title)
  }
  if (!["equipment-class", "equipment-background"].every((id) => chosenOption(context, id))) left.push("Equipment")
  if (character.name === UNTITLED_CHARACTER) left.push("Name")
  if (readLine(values.alignment?.value) === "") left.push("Alignment")
  return left
}
