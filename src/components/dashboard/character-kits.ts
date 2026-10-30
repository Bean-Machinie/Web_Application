import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { ARMOR, MEDIUM_ARMOR_DEX_CAP, SHIELD_AC, weaponById } from "@/lib/character-templates/srd-5-2-1-gear"
import type { Weapon } from "@/lib/character-templates/srd-5-2-1-gear"
import type { Kit, KitItem } from "@/lib/character-templates/srd-5-2-1-choices"
import { BACKGROUND_KITS, CLASS_KITS } from "@/lib/character-templates/srd-5-2-1-kits"
import { chosenOption, origins, picksOf } from "@/lib/character-grants"
import { proficientWith } from "@/lib/character-weapons"
import { readAttacks, readList, readStat } from "@/lib/character-values"
import type { Attack, ListItem } from "@/lib/character-values"
import type { SheetActions } from "./character-actions"

const KIT_PREFIX = "kit:"

export const allKits = () => [...Object.values(CLASS_KITS), ...Object.values(BACKGROUND_KITS)].flat()
export const kitById = (id: string | null | undefined) => allKits().find((kit) => kit.id === id) ?? null

// The kit chosen for the class and for the background; null while none. A choice by class or
// by background, so one that belongs to another class is not a choice.
export function chosenKits(actions: SheetActions) {
  return {
    classKit: kitById(chosenOption(actions, "equipment-class")?.id),
    backgroundKit: kitById(chosenOption(actions, "equipment-background")?.id),
  }
}

// How an item reads in the inventory: a tool the player chose stands in for its placeholder.
function itemText(item: KitItem, actions: SheetActions, picked: Record<string, string[]>) {
  const name = item.chosenTool ? ((picked[item.chosenTool] ?? picksOf(actions, item.chosenTool))[0] ?? item.name) : item.name
  return item.qty && item.qty > 1 ? `${item.qty} × ${name}` : name
}

// The ability a weapon attack uses: Dexterity for Ranged, the better of the two for Finesse, and
// for a Monk’s weapons Dexterity.
function abilityFor(weapon: Weapon, monk: boolean, actions: SheetActions) {
  const [str, dex] = [actions.derived["str.mod"] ?? 0, actions.derived["dex.mod"] ?? 0]
  if (weapon.ranged) return "dex"
  if (monk && (weapon.category === "simple" || weapon.light)) return "dex"
  return weapon.finesse && dex > str ? "dex" : "str"
}

// What the kits come to on the sheet: the gold, the items in the inventory, and an attack for
// each weapon. What an earlier kit put there is replaced, what the player added stays.
// `picked` has tools just chosen, which the actions do not hold yet; `newClass` is a class just
// chosen, whose kit rules apply before it is stored.
export function kitWrites(actions: SheetActions, kits: Kit[], picked: Record<string, string[]> = {}, newClass?: string) {
  const classId = newClass ?? origins(actions).cls?.id
  const build = classId ? CLASS_BUILD[classId] : null
  const order = newClass ? undefined : picksOf(actions, "class-order")[0]

  const items = kits.flatMap((kit) => kit.items.map((item, index) => ({ id: `${KIT_PREFIX}${kit.id}:${index}`, text: itemText(item, actions, picked) })))
  const inventory: ListItem[] = [...readList(actions.values.inventory?.value).filter((item) => !item.id.startsWith(KIT_PREFIX)), ...items]

  const weapons = [...new Set(kits.flatMap((kit) => kit.items.flatMap((item) => (item.weapon ? [item.weapon] : []))))]
  const made: Attack[] = weapons.flatMap((id) => {
    const weapon = weaponById(id)
    if (!weapon) return []
    return [{
      id: `${KIT_PREFIX}${id}`,
      name: weapon.label,
      ability: abilityFor(weapon, classId === "monk", actions),
      proficient: build ? proficientWith(build, weapon, order) : false,
      toHit: null,
      damage: weapon.damage,
      auto: true,
    }]
  })
  const attacks = [...readAttacks(actions.values.attacks?.value).filter((attack) => !attack.id.startsWith(KIT_PREFIX)), ...made]
  return { inventory, attacks, gp: kits.length > 0 ? kits.reduce((sum, kit) => sum + kit.gp, 0) : null }
}

export function applyKits(actions: SheetActions, kits: Kit[], picked: Record<string, string[]> = {}, newClass?: string) {
  const { inventory, attacks, gp } = kitWrites(actions, kits, picked, newClass)
  actions.onValue("inventory", inventory)
  actions.onValue("attacks", attacks)
  actions.onValue("coin.gp", gp)
}

// Whether the player has changed what the kits put on the sheet: a kit item or attack edited or
// removed, or the gold changed. Items they added do not count, they survive a rewrite.
export function kitsEdited(actions: SheetActions) {
  const { classKit, backgroundKit } = chosenKits(actions)
  const kits = [classKit, backgroundKit].filter((kit): kit is Kit => kit !== null)
  if (kits.length === 0) return false
  const expected = kitWrites(actions, kits)
  const mine = <T extends { id: string }>(list: T[], sign: (item: T) => unknown[]) => JSON.stringify(list.filter((item) => item.id.startsWith(KIT_PREFIX)).map(sign))
  const item = (entry: ListItem) => [entry.id, entry.text]
  const attack = (entry: Attack) => [entry.id, entry.name, entry.ability, entry.proficient, entry.toHit, entry.damage]
  return (
    mine(readList(actions.values.inventory?.value), item) !== mine(expected.inventory, item) ||
    mine(readAttacks(actions.values.attacks?.value), attack) !== mine(expected.attacks, attack) ||
    (readStat(actions.values["coin.gp"]?.value) ?? null) !== expected.gp
  )
}

// The Armor Class a kit gives, for the pill on its card: armor and Shield with Dexterity, and
// Defense if the Fighting Style was chosen. Null while Dexterity is unknown.
export function kitAc(kit: Kit, dexModifier: number | null, defense: boolean) {
  if (dexModifier === null) return null
  const armor = ARMOR.find((candidate) => candidate.id === kit.items.find((item) => item.armor)?.armor)
  const shield = kit.items.some((item) => item.shield) ? SHIELD_AC : 0
  if (!armor) return 10 + dexModifier + shield
  const dex = armor.kind === "heavy" ? 0 : armor.kind === "medium" ? Math.min(dexModifier, MEDIUM_ARMOR_DEX_CAP) : dexModifier
  return armor.base + dex + shield + (defense ? 1 : 0)
}
