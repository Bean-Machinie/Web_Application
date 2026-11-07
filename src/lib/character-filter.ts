import type { Character } from "./characters"

export type CharacterFilter = "all" | "in-campaign" | "no-campaign" | "drafts"

export const CHARACTER_FILTERS: { value: CharacterFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-campaign", label: "In a campaign" },
  { value: "no-campaign", label: "Not in a campaign" },
  { value: "drafts", label: "Drafts" },
]

export function filterCharacters<T extends { character: Character }>(items: T[], filter: CharacterFilter) {
  switch (filter) {
    case "in-campaign":
      return items.filter(({ character }) => character.campaignId !== null)
    case "no-campaign":
      return items.filter(({ character }) => character.campaignId === null)
    case "drafts":
      return items.filter(({ character }) => character.draft)
    case "all":
      return items
  }
}
