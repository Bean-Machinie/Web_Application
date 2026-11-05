export const DND_5E = "dnd-5e-2024"

export const GAME_SYSTEM_NAMES: Record<string, string> = { [DND_5E]: "D&D 5e (2024)" }

export const gameSystemName = (id: string) => GAME_SYSTEM_NAMES[id] ?? id

// The one question the rules reference asks of a campaign: the Rules page, its sidebar entry and
// the glossary chips in the journal all show only where this is true.
export const usesDnd5e = (campaign: { gameSystem: string }) => campaign.gameSystem === DND_5E
