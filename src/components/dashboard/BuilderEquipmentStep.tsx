import { origins, picksOf } from "@/lib/character-grants"
import { weaponById } from "@/lib/character-templates/srd-5-2-1-gear"
import type { Kit } from "@/lib/character-templates/srd-5-2-1-choices"
import { BACKGROUND_KITS, CLASS_KITS } from "@/lib/character-templates/srd-5-2-1-kits"
import { BuilderKitCard } from "./BuilderKitCard"
import type { BuilderProps } from "./builder-types"
import { applyKits, chosenKits, kitAc } from "./character-kits"

const NOTICE = "text-muted-foreground bg-muted/40 rounded-lg border px-4 py-3 text-sm"

// Step 6: the starting equipment, a kit or gold from the class and one from the background.
// Choosing writes the gold, the items and the weapon attacks to the sheet, and the armor
// worn sets the Armor Class.
export function BuilderEquipmentStep({ actions }: BuilderProps) {
  const { cls, background } = origins(actions)
  const { classKit, backgroundKit } = chosenKits(actions)
  const dex = actions.derived["dex.mod"] ?? null
  const defense = picksOf(actions, "class-style").includes("Defense")
  const armorClass = (kit: Kit) => kitAc(kit, dex, defense)

  function choose(field: "equipment-class" | "equipment-background", kit: Kit) {
    actions.onValue(field, kit.id)
    const [nextClass, nextBackground] = field === "equipment-class" ? [kit, backgroundKit] : [classKit, kit]
    applyKits(actions, [nextClass, nextBackground].filter((chosen) => chosen !== null))
  }

  const gold = (classKit?.gp ?? 0) + (backgroundKit?.gp ?? 0)
  const masteries = picksOf(actions, "class-masteries")
  const inKit = new Set([classKit, backgroundKit].flatMap((kit) => kit?.items.flatMap((item) => (item.weapon ? [item.weapon] : [])) ?? []))
  const kept = masteries.filter((id) => inKit.has(id))
  const left = masteries.filter((id) => !inKit.has(id))
  const nameOf = (ids: string[]) => ids.map((id) => weaponById(id)?.label).join(", ")

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
        <p className="text-muted-foreground text-sm">Your class and background each offer a ready-made kit, or gold to buy your own.</p>
      </div>
      {cls ? (
        <BuilderKitCard title={`From ${cls.label}`} kits={CLASS_KITS[cls.id]} selected={classKit?.id ?? null} armorClass={armorClass} onSelect={(kit) => choose("equipment-class", kit)} />
      ) : (
        <p className={NOTICE}>Choose a class in step 1 to see its equipment.</p>
      )}
      {background ? (
        <BuilderKitCard title={`From ${background.label}`} kits={BACKGROUND_KITS[background.id]} selected={backgroundKit?.id ?? null} armorClass={() => null} onSelect={(kit) => choose("equipment-background", kit)} />
      ) : (
        <p className={NOTICE}>Choose a background in step 2 to see its equipment.</p>
      )}
      <section aria-label="What this means" className="bg-card grid gap-4 rounded-lg border p-5 shadow-xs sm:grid-cols-3">
        <div>
          <span className="text-muted-foreground text-xs">Armor Class</span>
          <div className="text-2xl font-semibold tabular-nums">{actions.derived.ac ?? "—"}</div>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Gold</span>
          <div className="text-2xl font-semibold tabular-nums">{classKit || backgroundKit ? `${gold} GP` : "—"}</div>
          {classKit && backgroundKit && (
            <span className="text-muted-foreground text-xs">
              {classKit.gp} from {cls?.label} + {backgroundKit.gp} from {background?.label}
            </span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Your masteries in this kit</span>
          <div className="mt-1 text-sm font-medium">{kept.length > 0 ? nameOf(kept) : "None yet"}</div>
          {left.length > 0 && (
            <span className="text-muted-foreground text-xs">
              {nameOf(left)} {left.length === 1 ? "isn’t" : "aren’t"} included
            </span>
          )}
        </div>
      </section>
      <p className="text-muted-foreground text-xs">
        SRD 5.2.1 · Starting equipment, {cls ? `${cls.label} p. ${cls.page}, ` : ""}Backgrounds p. 83, Armor p. 92
      </p>
    </div>
  )
}
