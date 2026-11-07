export type SrdSection = "creatures" | "rules"

export const SRD_LABEL = "SRD 5.2.1"

// The tree node of a section of the SRD, as the address of Rules names it.
export const srdNodeId = (section: SrdSection) => `srd:${section}`

// The SRD is read in the compendium, so its pages belong to no campaign.
export const srdPath = (section: SrdSection = "creatures", itemId?: string) =>
  itemId ? `/app/compendium/${section}/${itemId}` : `/app/compendium/${section}`

export const monsterPath = (monsterId?: string) => srdPath("creatures", monsterId)
