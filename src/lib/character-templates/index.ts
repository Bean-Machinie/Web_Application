import { FREEFORM } from "./freeform"
import type { CharacterTemplate } from "./types"

// Every released version of every template. A new one is one more entry here.
const TEMPLATES: CharacterTemplate[] = [FREEFORM]

// What a new character is made from.
export const NEW_CHARACTER_TEMPLATE = FREEFORM

export const templateFor = (id: string, version: number) =>
  TEMPLATES.find((template) => template.id === id && template.version === version) ?? null
