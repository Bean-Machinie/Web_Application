export type SrdSection = "creatures" | "rules"

export const SRD_LABEL = "SRD 5.2.1"

// The tree node of a section of the SRD, as the library's address names it.
export const srdNodeId = (section: SrdSection) => `srd:${section}`

// The SRD is a source in the library, so its pages belong to no campaign.
export const srdPath = (section: SrdSection = "creatures", itemId?: string) =>
  itemId ? `/app/library/srd/${section}/${itemId}` : `/app/library/srd/${section}`

export const monsterPath = (monsterId?: string) => srdPath("creatures", monsterId)
