import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
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
import { SaveIndicator } from "./SaveIndicator"
import { sheetActions } from "./sheet-actions"

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
    <div className="mx-auto flex w-[1376px] max-w-full flex-col gap-5">
      <header className="flex justify-end">
        <div className="flex items-center gap-3">
          <SaveIndicator state={sheet.saveState} />
          <Button variant="outline" onClick={() => navigate("/app/library?section=characters")}>Save and exit</Button>
        </div>
      </header>
      <BuilderStepper step={step.id} progress={progress} onStep={go} />
      {sheet.error && <p className="text-destructive text-sm">{sheet.error}</p>}
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_720px] flex-col">{body}</div>
        <BuilderPanel actions={actions} character={character} step={step.id} left={stillToChoose(state)} />
      </div>
      <footer className="flex items-center justify-between border-t pt-4">
        <Button variant="ghost" disabled={!previous} onClick={() => previous && go(previous.id)}>Back</Button>
        <span className="text-muted-foreground text-sm">Step {index + 1} of {BUILDER_STEPS.length}</span>
        {next ? (
          <Button onClick={() => go(next.id)}>Continue to {next.label}</Button>
        ) : (
          <Button onClick={() => navigate(characterPath(character.id))}>Finish and open sheet</Button>
        )}
      </footer>
    </div>
  )
}
