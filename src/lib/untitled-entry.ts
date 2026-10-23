import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// What a new entry is called until it is named.
export const untitledName = (kind: WorldEntryKind) => `Untitled ${WORLD_KINDS[kind].noun}`

// Whether a saved field holds nothing: never filled in, or cleared again.
export const isEmptyValue = (value: unknown) =>
  value == null || value === "" || (Array.isArray(value) && value.length === 0)
