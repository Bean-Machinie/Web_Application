import type { ClassBuild } from "./character-templates/srd-5-2-1-classes"
import type { Weapon } from "./character-templates/srd-5-2-1-gear"

// Whether a class is proficient with a weapon (its Weapon Proficiencies, p. 28 to p. 77), and
// the Cleric’s Protector and the Druid’s Warden, which add Martial weapons (pp. 37 and 42).
export function proficientWith(build: ClassBuild, weapon: Weapon, order: string | undefined) {
  if (weapon.category === "simple") return build.weapons.simple
  if (order === "protector" || order === "warden") return true
  const { martial } = build.weapons
  if (martial === "all") return true
  if (martial === "light") return !!weapon.light && !weapon.ranged
  if (martial === "finesse-light") return !!weapon.light || !!weapon.finesse
  return false
}
