import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import type { useCharacter } from "@/hooks/use-character"
import { BUILDER_STEPS, builderProgress, stillToChoose } from "@/lib/character-builder"
import { characterPath } from "@/lib/characters"
import { cn } from "@/lib/utils"
import type { Character } from "@/lib/characters"
import { BuilderActionBar } from "./BuilderActionBar"
import { BuilderAbilitiesStep } from "./BuilderAbilitiesStep"
import { BuilderBackgroundStep } from "./BuilderBackgroundStep"
import { BuilderChoicesStep } from "./BuilderChoicesStep"
import { BuilderClassStep } from "./BuilderClassStep"
import { BuilderDetailsStep } from "./BuilderDetailsStep"
import { BuilderEquipmentStep } from "./BuilderEquipmentStep"
import { BuilderHeader } from "./BuilderHeader"
import { BuilderPanel } from "./BuilderPanel"
import { BuilderSpeciesStep } from "./BuilderSpeciesStep"
import { BuilderStepper } from "./BuilderStepper"
import { BUILDER_SCROLL } from "./builder-scroll"
import { sheetActions } from "./sheet-actions"

// The steps that are a list beside a detail; the others are one column of content.
const LIST_STEPS = ["class", "background", "species"]

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character }

// The guided builder in seven steps: a header, the stepper, the open step beside a panel on the
// character so far, and Back and Continue under it. Each choice is saved as it is made, so leaving
// is safe. The open step is in the address, so the sheet can link to the first one unfinished.
export function CharacterBuilder({ sheet, character }: Props) {
  const navigate = useNavigate()
  const userId = useAuth().session!.user.id
  const [params, setParams] = useSearchParams()
  const index = Math.max(BUILDER_STEPS.findIndex((candidate) => candidate.id === params.get("step")), 0)
  const step = BUILDER_STEPS[index]
  const actions = sheetActions(sheet, character.id, userId)
  const state = { character, fields: sheet.fields, values: sheet.values, derived: sheet.derived }
  const progress = builderProgress(state)
  const props = { actions, sheet, character, userId }
  const previous = BUILDER_STEPS[index - 1]
  const next = BUILDER_STEPS[index + 1]
  const go = (id: string) => setParams({ step: id }, { replace: true })

  const body = {
    class: <BuilderClassStep {...props} />,
    background: <BuilderBackgroundStep {...props} />,
    species: <BuilderSpeciesStep {...props} />,
    abilities: <BuilderAbilitiesStep {...props} />,
    choices: <BuilderChoicesStep {...props} />,
    equipment: <BuilderEquipmentStep {...props} />,
    details: <BuilderDetailsStep {...props} />,
  }[step.id]

  return (
    <div className="-m-4 flex h-[calc(100svh-var(--header-height))] flex-col md:-m-6">
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-8">
        <BuilderHeader sheet={sheet} character={character} />
        <div className="shrink-0 border-b pt-6 pb-7">
          <BuilderStepper step={step.id} progress={progress} onStep={go} />
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col gap-6 pt-6 pb-6 min-[1100px]:flex-row", BUILDER_SCROLL, "min-[1100px]:overflow-visible")}>
          {LIST_STEPS.includes(step.id) ? body : <div className={cn("min-w-0 flex-1 min-[1100px]:min-h-0", BUILDER_SCROLL)}>{body}</div>}
          <BuilderPanel actions={actions} character={character} step={step.id} left={stillToChoose(state)} />
        </div>
      </div>
      <BuilderActionBar
        index={index}
        total={BUILDER_STEPS.length}
        nextLabel={next?.label}
        onBack={previous && (() => go(previous.id))}
        onNext={() => (next ? go(next.id) : navigate(characterPath(character.id)))}
      />
    </div>
  )
}
