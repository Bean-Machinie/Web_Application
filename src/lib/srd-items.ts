import { MONSTERS } from "./compendium-monsters"
import { RULE_ENTRIES } from "./rules-terms"
import type { SrdSection } from "./srd-paths"

// A tree node of the SRD is "srd:creatures" or "srd:rules", or one of their children,
// "srd:creatures:Beast" (a type) and "srd:rules:<category id>".
export const isSrdNode = (nodeId: string) => nodeId.startsWith("srd:")

export const srdSectionOf = (nodeId: string): SrdSection => (nodeId.startsWith("srd:rules") ? "rules" : "creatures")

// The type or category a node narrows to; empty for a section as a whole.
export const srdChild = (nodeId: string) => nodeId.split(":").slice(2).join(":")

export const monstersIn = (nodeId: string) => {
  const type = srdChild(nodeId)
  return type ? MONSTERS.filter((monster) => monster.statBlock.type === type) : MONSTERS
}

export const rulesIn = (nodeId: string) => {
  const category = srdChild(nodeId)
  return category ? RULE_ENTRIES.filter((entry) => entry.category === category) : RULE_ENTRIES
}

export const srdCount = (nodeId: string) => (srdSectionOf(nodeId) === "rules" ? rulesIn(nodeId) : monstersIn(nodeId)).length
