import data from "@/data/srd-monsters.json"
import type { StatBlock } from "./stat-block-types"

// The id creatures made from this file carry in their compendiumRef.
export const SRD_SOURCE = "srd-5.2.1"

export type Monster = {
  id: string
  name: string
  source: { document: string; page: number }
  statBlock: StatBlock
}

type RawMonster = StatBlock & Omit<Monster, "statBlock">

export const MONSTERS: Monster[] = (data.monsters as unknown as RawMonster[])
  .map(({ id, name, source, ...statBlock }) => ({ id, name, source, statBlock }))
  .sort((a, b) => a.name.localeCompare(b.name))

const BY_ID = new Map(MONSTERS.map((monster) => [monster.id, monster]))

export const monsterById = (id: string | undefined) => (id ? BY_ID.get(id) : undefined)

// "1/8" is 0.125.
export function crNumber(value: string) {
  const [top, bottom] = value.split("/").map(Number)
  return bottom ? top / bottom : top
}

const unique = (values: string[]) => [...new Set(values)]

export const CR_VALUES = unique(MONSTERS.map((monster) => monster.statBlock.cr.value)).sort((a, b) => crNumber(a) - crNumber(b))
export const MONSTER_TYPES = unique(MONSTERS.map((monster) => monster.statBlock.type)).sort()

export const ANY = "any"

export type MonsterFilter = { query: string; crMin: string; crMax: string; type: string }

export const NO_FILTER: MonsterFilter = { query: "", crMin: ANY, crMax: ANY, type: ANY }

export function matchingMonsters({ query, crMin, crMax, type }: MonsterFilter) {
  const text = query.trim().toLowerCase()
  return MONSTERS.filter(({ name, statBlock }) => {
    const cr = crNumber(statBlock.cr.value)
    return (
      name.toLowerCase().includes(text) &&
      (crMin === ANY || cr >= crNumber(crMin)) &&
      (crMax === ANY || cr <= crNumber(crMax)) &&
      (type === ANY || statBlock.type === type)
    )
  })
}
