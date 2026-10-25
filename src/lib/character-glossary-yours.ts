import { choiceState } from "./character-choices"
import { picksOf } from "./character-grants"
import type { GlossaryContext } from "./character-glossary"
import { CARRY_PER_STRENGTH, INCREASE_TO } from "./character-templates/dnd-5e-2024-tables"
import { ABILITIES, BACKGROUNDS, CLASSES, SKILLS, SPECIES } from "./character-templates/srd-5-2-1"
import { featById } from "./character-templates/srd-5-2-1-feats"
import { CLASS_NOTES, SPECIES_TRAITS } from "./character-templates/srd-5-2-1-glossary"
import { readStat } from "./character-values"

const signed = (value: number) => (value >= 0 ? `+${value}` : String(value))
const nameOf = (ability: string) => ABILITIES.find(([id]) => id === ability)?.[1] ?? ability

// "Your value" lines for a hover card: the calculation with this character’s numbers, and
// nothing while a number it needs is missing.
export function yoursFor(key: string, fieldId: string, context: GlossaryContext): string[] {
  const { values, derived, byId } = context
  const num = (id: string) => derived[id] ?? readStat(values[id]?.value)
  const chosen = (id: string) => {
    const field = byId.get(id)
    return field ? (choiceState(field, byId, derived).selected ?? null) : null
  }
  const bonus = num("proficiency-bonus")
  const level = num("level")
  const die = num("hit-die")
  const label = (id: string) => chosen(id)?.label

  // A modifier, plus the Proficiency Bonus if proficient, for a save or a skill.
  const roll = (modifier: number | null, proficient: boolean, total: number | null, name: string) =>
    modifier === null || total === null
      ? []
      : [`${signed(modifier)} ${name}${proficient ? ` + ${bonus ?? "?"} proficiency` : ", not proficient"} = ${signed(total)}`]

  const [group, rest] = key.split(".")
  if (group === "ability") {
    const base = readStat(values[rest]?.value)
    const total = num(`${rest}.total`)
    if (total === null) return []
    const source = label("background-choice") ?? "your background"
    return [base !== null && base !== total ? `${base} + ${total - base} from ${source} = ${total}` : `Score ${total}`]
  }
  if (key === "modifier") {
    const total = num(`${fieldId.split(".")[0]}.total`)
    const mod = num(fieldId)
    if (total === null || mod === null) return []
    const worked = Math.floor((total - 10) / 2)
    return [`${total} − 10 = ${total - 10}, ÷ 2 rounded down = ${signed(worked)}`, ...(mod !== worked ? [`The sheet uses ${signed(mod)} (edited)`] : [])]
  }
  if (group === "save") return roll(num(`${rest}.mod`), (num(`save.${rest}.prof`) ?? 0) > 0, num(`save.${rest}`), nameOf(rest))
  if (group === "skill") {
    const ability = SKILLS.find(([id]) => id === rest)?.[2] ?? "str"
    return roll(num(`${ability}.mod`), (num(`skill.${rest}.prof`) ?? 0) > 0, num(`skill.${rest}`), nameOf(ability))
  }

  switch (key) {
    case "proficiency-bonus":
      return level === null || bonus === null ? ["Enter your level"] : [`Level ${level} → ${signed(bonus)}`]
    case "ac": {
      const dex = num("dex.mod")
      return [...(num("ac") !== null ? [`AC ${num("ac")}`] : []), ...(dex !== null ? [`Without armor: 10 ${signed(dex)} = ${10 + dex}`] : [])]
    }
    case "initiative":
      return num("dex.mod") === null ? [] : [`Dexterity modifier ${signed(num("dex.mod")!)}`]
    case "speed": {
      const species = label("species-choice")
      return num("speed") === null ? [] : [`${num("speed")} ft${species ? ` (${species})` : ""}`]
    }
    case "darkvision":
      return num("darkvision") === null ? [] : [num("darkvision") === 0 ? "None" : `${num("darkvision")} ft`]
    case "size": {
      const species = label("species-choice")
      return label("size") ? [`${label("size")}${species ? ` (${species})` : ""}`] : []
    }
    case "passive-perception":
      return num("passive-perception") === null ? [] : [`10 ${signed(num("skill.perception")!)} (Perception) = ${num("passive-perception")}`]
    case "hp": {
      const con = num("con.mod")
      const max = num("hp.max")
      if (max === null || die === null || con === null || level === null) return ["Needs a class, level and Constitution"]
      const more = level > 1 ? ` + ${level - 1} × (${Math.floor(die / 2) + 1} ${signed(con)})` : ""
      const toughness = chosen("species-choice")?.id === "dwarf" ? ` + ${level} (Dwarven Toughness)` : ""
      return [`Maximum ${max}: ${die} ${signed(con)} at level 1${more}${toughness}`]
    }
    case "hit-dice":
      return level === null || die === null ? [] : [`${level} × d${die}`]
    case "hit-die":
      return die === null ? [] : [`d${die} (${label("character-class")})`]
    case "inspiration":
      return [values.inspiration?.value === true ? "You have it" : "You do not have it"]
    case "spell-ability":
      return label("spell-ability") ? [label("spell-ability")!] : ["Your class has no spellcasting"]
    case "spell-dc":
    case "spell-attack": {
      const ability = chosen("spell-ability")?.id
      const mod = ability ? num(`${ability}.mod`) : null
      const total = num(key)
      if (!ability || mod === null || bonus === null || total === null) return []
      return [key === "spell-dc" ? `8 ${signed(mod)} (${nameOf(ability)}) + ${bonus} = ${total}` : `${signed(mod)} (${nameOf(ability)}) + ${bonus} = ${signed(total)}`]
    }
    case "carrying-capacity": {
      const size = chosen("size")?.id
      const strength = num("str.total")
      return !size || strength === null ? [] : [`Strength ${strength} × ${CARRY_PER_STRENGTH[size]} lb = ${num("carrying-capacity")} lb`]
    }
    case "class": {
      const cls = CLASSES.find((candidate) => candidate.id === chosen("character-class")?.id)
      return cls ? [`${cls.label}: primary ability ${CLASS_NOTES[cls.id].primary} (p. ${CLASS_NOTES[cls.id].page})`] : []
    }
    case "species": {
      const species = SPECIES.find((candidate) => candidate.id === chosen("species-choice")?.id)
      return species ? [`${species.label}: ${SPECIES_TRAITS[species.id].traits} (p. ${SPECIES_TRAITS[species.id].page})`] : []
    }
    case "background": {
      const background = BACKGROUNDS.find((candidate) => candidate.id === chosen("background-choice")?.id)
      const skills = background?.skills.map((skill) => SKILLS.find(([id]) => id === skill)?.[1]).join(" and ")
      return background ? [`${background.label}: ${background.feat}; ${skills}; ${background.tool}`] : []
    }
    case "origin-feat":
    case "versatile": {
      const feat = fieldId === "species-feat" ? picksOf(context, "species-feat")[0] : chosen(fieldId)?.id
      const found = feat ? featById(feat) : undefined
      return found ? [`${found.label}: ${found.benefit}`] : []
    }
    case "tool":
      return label("tool-proficiency") ? [label("tool-proficiency")!] : []
    case "ability-increase": {
      const id = chosen("ability-increase")?.id
      const parts = ABILITIES.flatMap(([ability]) => (id && INCREASE_TO(ability)[id] ? [`${nameOf(ability)} +${INCREASE_TO(ability)[id]}`] : []))
      return parts.length ? [parts.join(", ")] : []
    }
    default:
      return []
  }
}
