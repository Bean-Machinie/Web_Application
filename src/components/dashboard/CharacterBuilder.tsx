import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import type { useCharacter } from "@/hooks/use-character"
import { BUILDER_STEPS, builderProgress, stillToChoose } from "@/lib/character-builder"
import { characterPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { BuilderAbilitiesStep } from "./BuilderAbilitiesStep"
import { BuilderBackgroundStep } from "./BuilderBackgroundStep"
import { BuilderChoicesStep } from "./BuilderChoicesStep"
import { BuilderClassStep } from "./BuilderClassStep"
import { BuilderDetailsStep } from "./BuilderDetailsStep"
import { BuilderEquipmentStep } from "./BuilderEquipmentStep"
import { BuilderPanel } from "./BuilderPanel"
import { BuilderSpeciesStep } from "./BuilderSpeciesStep"
import { BuilderStepper } from "./BuilderStepper"
import { BuilderToolbarActions } from "./BuilderToolbarActions"
import { CollectionPage } from "./CollectionPage"
import { sheetActions } from "./sheet-actions"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character }

// The guided builder in seven steps: one sticky bar with the stepper and Back and Continue, and
// under it the open step beside a panel on the character so far. The page scrolls. Each choice is saved as it is made, so leaving
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
    <>
      <CollectionPage
        tabs={<BuilderStepper step={step.id} progress={progress} onStep={go} />}
        actions={
          <BuilderToolbarActions
            saveState={sheet.saveState}
            error={sheet.error}
            last={!next}
            onBack={previous && (() => go(previous.id))}
            onNext={() => (next ? go(next.id) : navigate(characterPath(character.id)))}
          />
        }
      >
        <div className="flex flex-col gap-6 min-[1100px]:flex-row min-[1100px]:items-start">
          {body}
          <BuilderPanel actions={actions} character={character} step={step.id} left={stillToChoose(state)} />
        </div>
      </CollectionPage>
    </>
  )
}
