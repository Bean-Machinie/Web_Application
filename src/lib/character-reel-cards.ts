import type { CharacterCardData } from "@/hooks/use-character-cards"
import { portraitUrl } from "./template-portraits"
import { characterSubtitle } from "./character-summary"
import { STARTER_VILLAGE } from "./starter-village"

export type ReelCardData = { key: string; name: string; line: string; image: string | null }

// Fewer different faces than this and the reel feels empty, so the starter village's people fill in.
const MIN_FACES = 5
// The reel wraps around; with fewer slots than this the wrap would show at its edges.
const MIN_SLOTS = 11

const fieldText = (fields: { key: string; value: unknown }[], key: string) => {
  const value = fields.find((field) => field.key === key)?.value
  return typeof value === "string" ? value : ""
}

const STAND_INS: ReelCardData[] = STARTER_VILLAGE.entries
  .filter((entry) => entry.kind === "npc")
  .map((entry) => ({
    key: `village-${entry.name}`,
    name: entry.name,
    line: [fieldText(entry.fields, "species"), fieldText(entry.fields, "role")].filter(Boolean).join(" · "),
    image: portraitUrl(STARTER_VILLAGE, entry),
  }))

// Your characters, newest first, topped up with the village's people and repeated until the reel is full.
export function reelCards(cards: CharacterCardData[]): ReelCardData[] {
  const own = cards.slice(0, 12).map(({ character, summary }) => ({
    key: character.id,
    name: character.name,
    line: characterSubtitle(character, summary),
    image: character.portrait?.url ?? null,
  }))
  const faces = [...own, ...STAND_INS.slice(0, Math.max(0, MIN_FACES - own.length))]
  const slots: ReelCardData[] = []
  for (let round = 0; slots.length < MIN_SLOTS; round++) {
    slots.push(...faces.map((card) => ({ ...card, key: `${card.key}#${round}` })))
  }
  return slots
}
