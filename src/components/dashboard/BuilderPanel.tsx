import { User } from "lucide-react"
import { formatNumber } from "@/lib/character-derive"
import { featGrants, origins, picksOf, toolGrants } from "@/lib/character-grants"
import { ABILITIES, SKILLS } from "@/lib/character-templates/srd-5-2-1"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { readAttacks, readStat } from "@/lib/character-values"
import type { BuilderStep } from "@/lib/character-builder"
import type { Character } from "@/lib/characters"
import type { SheetActions } from "./character-actions"

type Props = { actions: SheetActions; character: Character; step: BuilderStep; left: string[] }

const TILE = "bg-muted/40 rounded-lg px-2.5 py-2"
const signed = (value: number) => (value >= 0 ? `+${value}` : String(value))

function Tile({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className={`${TILE} min-w-0`}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className={`truncate font-semibold whitespace-nowrap tabular-nums ${small ? "text-xs leading-6" : ""}`}>{value}</div>
    </div>
  )
}

function Group({ title, children, separate }: { title: string; children: string[]; separate?: boolean }) {
  if (children.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{title}</span>
      {separate ? children.map((line) => <span key={line} className="text-sm">{line}</span>) : <span className="text-sm">{children.join(", ")}</span>}
    </div>
  )
}

// "Your character": the portrait and name, the numbers so far, what the character is
// proficient in, the feats, the languages and attacks, and what is still to choose. It grows
// as the steps are done.
export function BuilderPanel({ actions, character, step, left }: Props) {
  const { cls, species, background } = origins(actions)
  const level = readStat(actions.values.level?.value)
  const { derived } = actions
  const num = (id: string) => derived[id] ?? null
  const die = num("hit-die")
  const hp = num("hp.max")
  const tiles: [string, string][] = [
    ["Hit Points", hp !== null ? String(hp) : die !== null ? `${die} + Con` : "—"],
    step === "species" ? ["Speed", formatNumber(num("speed"), "feet")] : step === "abilities" ? ["Initiative", formatNumber(num("initiative"), "signed")] : step === "choices" ? ["Passive", String(num("passive-perception") ?? "—")] : step === "details" ? ["Speed", formatNumber(num("speed"), "feet")] : ["AC", String(num("ac") ?? "—")],
    step === "details" ? ["AC", String(num("ac") ?? "—")] : ["Prof.", formatNumber(num("proficiency-bonus"), "signed")],
  ]
  const skills = SKILLS.filter(([id]) => (num(`skill.${id}.prof`) ?? 0) > 0).map(([id, label]) => `${label} ${signed(num(`skill.${id}`) ?? 0)}`)
  const saves = cls ? ABILITIES.filter(([id]) => (num(`save.${id}.prof`) ?? 0) > 0).map(([id, label]) => `${label} ${signed(num(`save.${id}`) ?? 0)}`) : []
  const tools = [...new Set(toolGrants(actions).map((grant) => grant.id))]
  const feats = featGrants(actions).map((grant) => grant.id)
  const languages = ["Common", ...picksOf(actions, "languages"), ...(cls && CLASS_BUILD[cls.id].extraLanguages > 0 ? ["Thieves’ Cant"] : [])]
  const attacks = readAttacks(actions.values.attacks?.value).map((attack) => {
    const modifier = attack.ability ? (num(`${attack.ability}.mod`) ?? 0) : 0
    const hit = attack.toHit ?? modifier + (attack.proficient ? (num("proficiency-bonus") ?? 0) : 0)
    return `${attack.name} ${signed(hit)} · ${attack.damage} ${signed(modifier)}`
  })

  return (
    <aside aria-label="Your character" className="bg-card flex w-full shrink-0 flex-col gap-4 rounded-lg border p-5 shadow-xs min-[1100px]:sticky min-[1100px]:top-[calc(var(--collection-top)+1.5rem)] min-[1100px]:w-[320px]">
      <div className="flex items-center gap-3">
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {character.portrait ? <img src={character.portrait.url} alt="" className="size-full object-cover" /> : <User className="text-muted-foreground size-5" />}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{character.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {[cls ? `${cls.label} ${level ?? ""}`.trim() : null, species?.label, background?.label].filter(Boolean).join(" · ") || "Nothing chosen yet"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([label, value]) => (
          <Tile key={label} label={label} value={value} small={label === "Hit Points" && hp === null && value !== "—"} />
        ))}
      </div>
      {step === "details" && (
        <div className="grid grid-cols-3 gap-1.5">
          {ABILITIES.map(([id]) => (
            <div key={id} className={`${TILE} text-center`}>
              <span className="text-muted-foreground text-xs">{id.toUpperCase()}</span>
              <div className="font-semibold tabular-nums">{formatNumber(num(`${id}.mod`), "signed")}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 border-t pt-4">
        <Group title="Proficient in">{[...skills, ...tools]}</Group>
        <Group title="Saving throws">{saves}</Group>
        <Group title="Feats">{feats}</Group>
        <Group title="Languages">{languages.length > 1 ? languages : []}</Group>
        <Group title="Attacks" separate>{attacks}</Group>
      </div>
      {left.length > 0 && (
        <div className="border-t pt-4">
          <span className="text-muted-foreground text-xs">Still to choose</span>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {left.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {left.length > 5 && <li className="text-muted-foreground">+{left.length - 5} more</li>}
          </ul>
        </div>
      )}
    </aside>
  )
}
