import { latestVersion, templateFor } from "./character-templates"
import { readResource } from "./character-values"
import { setCharacterTemplateVersion, setCharacterValue } from "./characters"
import type { Character, StoredValue } from "./characters"

// Carries a character on an older version of its template over to the newest, with no
// question asked. Every id keeps its meaning, so what was stored stays. The one change of
// shape: a resource whose maximum is now worked out had its own maximum stored beside the
// current value, and that becomes the player's own figure for it. The version moves last,
// so a failure part way leaves the old sheet, tried again at the next load.
export async function upgradeCharacter(character: Character, values: Record<string, StoredValue>) {
  const version = latestVersion(character.templateId)
  const next = templateFor(character.templateId, version)
  if (!next || version <= character.templateVersion) return { character, values }

  const carried = { ...values }
  for (const field of next.fields) {
    const max = field.maxFrom ? readResource(values[field.id]?.value)?.max : undefined
    if (field.maxFrom && max && carried[field.maxFrom]?.value == null) {
      await setCharacterValue(character.id, field.maxFrom, max)
      carried[field.maxFrom] = { value: max, pinned: carried[field.maxFrom]?.pinned ?? null }
    }
  }
  await setCharacterTemplateVersion(character.id, version)
  return { character: { ...character, templateVersion: version }, values: carried }
}
