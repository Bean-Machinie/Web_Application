import type { Derived } from "./character-derive"
import type { ClassBuild } from "./character-templates/srd-5-2-1-classes"
import { WEAPONS, weaponById } from "./character-templates/srd-5-2-1-gear"
import type { Weapon } from "./character-templates/srd-5-2-1-gear"
import type { Attack } from "./character-values"

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

// Whether an attack is made with a Ranged weapon: the weapon of a kit's attack, or one the player
// named after a weapon. Anything else is not known to be.
export const isRangedAttack = (attack: Attack) =>
  (weaponById(attack.id.replace("kit:", "")) ?? WEAPONS.find((weapon) => weapon.label === attack.name))?.ranged === true

// The to-hit the sheet works out for an attack: the modifier of the ability it uses, the
// Proficiency Bonus if proficient, and the bonus a Ranged weapon gets (Archery). Null while any of
// them is unknown. All three are the template's own values.
export function toHitOf(attack: Attack, derived: Derived) {
  const modifier = attack.ability ? (derived[`${attack.ability}.mod`] ?? null) : null
  const bonus = derived["proficiency-bonus"] ?? null
  if (modifier === null || (attack.proficient && bonus === null)) return null
  return modifier + (attack.proficient ? bonus! : 0) + (isRangedAttack(attack) ? (derived["attack-ranged-bonus"] ?? 0) : 0)
}
