import type { Card } from "@/lib/character-cards"
import { cardStatus } from "@/lib/character-cards"
import { MASTERY_NOTES } from "@/lib/character-templates/srd-5-2-1-gear"
import { BuilderChipPicker } from "./BuilderChipPicker"
import { BuilderChoiceCard } from "./BuilderChoiceCard"
import { BuilderFeatPicker } from "./BuilderFeatPicker"
import { BuilderOptionCards } from "./BuilderOptionCards"
import { applyKits, chosenKits } from "./character-kits"
import { expertiseChips, languageChips, skilledChips, toolChips, weaponChips } from "./builder-chips"
import type { SheetActions } from "./character-actions"

type Props = { card: Card; actions: SheetActions }

const MASTERY_HELP = `Each adds its mastery effect when you hit (${Object.keys(MASTERY_NOTES).join(", ")}). You can swap one after a Long Rest.`

// Every choice that is not skills and not the Human’s Origin feat: a Fighting Style, weapon
// masteries, expertise, an order or ancestry, tools, languages, Skilled’s picks. What each
// asks for comes from its declaration in the SRD data.
export function BuilderPickCard({ card, actions }: Props) {
  const { decl, chosen } = card
  const save = (next: string[]) => {
    actions.onValue(decl.field, next.length > 0 ? next : null)
    // A tool chosen is named in the inventory by the kit that holds it.
    if (decl.field === "class-tools" || decl.field === "background-tool") {
      const { classKit, backgroundKit } = chosenKits(actions)
      const kits = [classKit, backgroundKit].filter((kit) => kit !== null)
      if (kits.length > 0) applyKits(actions, kits, { [decl.field]: next })
    }
  }
  const frame = (help: string | undefined, children: React.ReactNode) => (
    <BuilderChoiceCard title={decl.title} source={card.source} status={cardStatus(card)} help={help} className="flex-[1_1_380px]">
      {children}
    </BuilderChoiceCard>
  )

  switch (decl.kind) {
    case "feat":
      return frame(undefined, <BuilderFeatPicker field={decl.field} category={decl.category} recommended={decl.recommended} value={chosen} actions={actions} />)
    case "options":
      return frame(undefined, <BuilderOptionCards options={decl.options} value={chosen} count={decl.count} onChange={save} label={decl.title} />)
    case "weapons":
      return frame(
        `Pick ${decl.count} kinds of weapons. ${MASTERY_HELP}`,
        <BuilderChipPicker chips={weaponChips(decl, actions)} value={chosen} count={decl.count} onChange={save} label={decl.title} />
      )
    case "expertise": {
      const chips = expertiseChips(actions)
      return frame(
        "Double your Proficiency Bonus on skills you are proficient in. Sleight of Hand and Stealth are recommended.",
        chips.length > 0 ? <BuilderChipPicker chips={chips} value={chosen} count={decl.count} onChange={save} label={decl.title} /> : <p className="text-muted-foreground text-sm">Choose your skills first.</p>
      )
    }
    case "tools":
      return frame(`You are proficient with ${decl.count === 1 ? "it" : "them"}.`, <BuilderChipPicker chips={toolChips(decl, actions)} value={chosen} count={decl.count} onChange={save} label={decl.title} />)
    case "languages":
      return frame(
        `You know Common, plus ${decl.count} standard ${decl.count === 1 ? "language" : "languages"}.`,
        <div className="grid gap-2">
          <span className="text-muted-foreground text-xs">Common · known</span>
          <BuilderChipPicker chips={languageChips()} value={chosen} count={decl.count} onChange={save} label={decl.title} />
        </div>
      )
    case "skilled": {
      const { skills, tools } = skilledChips(actions, decl.field)
      return frame(
        "Proficiency in any combination of three skills or tools.",
        <div className="grid gap-3">
          <BuilderChipPicker chips={skills} value={chosen} count={decl.count} onChange={save} label="Skills" />
          <BuilderChipPicker chips={tools} value={chosen} count={decl.count} onChange={save} label="Tools" />
        </div>
      )
    }
    default:
      return null
  }
}
