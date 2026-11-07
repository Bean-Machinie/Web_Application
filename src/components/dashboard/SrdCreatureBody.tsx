import { Badge } from "@/components/ui/badge"
import type { Monster } from "@/lib/compendium-monsters"
import { StatBlock } from "./StatBlock"

// What an SRD creature shows to read: the name with its challenge rating, the line under it, and
// the stat block. In the library's panel and on the creature's own page.
export function SrdCreatureBody({ monster }: { monster: Monster }) {
  const badge = <Badge variant="secondary">CR {monster.statBlock.cr.value}</Badge>
  return <StatBlock name={monster.name} badge={badge} block={monster.statBlock} source={monster.source} />
}
