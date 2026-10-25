import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
import type { useCharacter } from "@/hooks/use-character"
import { BUILDER_STEPS, builderProgress } from "@/lib/character-builder"
import type { BuilderStep } from "@/lib/character-builder"
import { characterPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { BuilderAbilitiesStep } from "./BuilderAbilitiesStep"
import { BuilderBackgroundStep } from "./BuilderBackgroundStep"
import { BuilderClassStep } from "./BuilderClassStep"
import { BuilderDetailsStep } from "./BuilderDetailsStep"
import { BuilderSpeciesStep } from "./BuilderSpeciesStep"
import { BuilderStepper } from "./BuilderStepper"
import { SaveIndicator } from "./SaveIndicator"
import { sheetActions } from "./sheet-actions"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character }

// The guided builder: a stepper along the top, the open step in a fixed-size area, and Back
// and Next under it. Each choice is saved as it is made, so leaving is safe. The open step is in
// the address, so the sheet can link to the first one unfinished.
export function CharacterBuilder({ sheet, character }: Props) {
  const navigate = useNavigate()
  const userId = useAuth().session!.user.id
  const [params, setParams] = useSearchParams()
  const index = Math.max(BUILDER_STEPS.findIndex((candidate) => candidate.id === params.get("step")), 0)
  const step = BUILDER_STEPS[index]
  const actions = sheetActions(sheet, character.id, userId)
  const progress = builderProgress({ character, fields: sheet.fields, values: sheet.values, derived: sheet.derived })
  const props = { actions, sheet, character, userId }
  const next = BUILDER_STEPS[index + 1]
  const go = (id: BuilderStep) => setParams({ step: id }, { replace: true })

  const body = {
    class: <BuilderClassStep {...props} />,
    background: <BuilderBackgroundStep {...props} />,
    species: <BuilderSpeciesStep {...props} />,
    abilities: <BuilderAbilitiesStep {...props} />,
    details: <BuilderDetailsStep {...props} />,
  }[step.id]
  const framed = step.id === "abilities" || step.id === "details"

  return (
    <div className="mx-auto flex w-[1000px] max-w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight">{character.name}</h1>
        <SaveIndicator state={sheet.saveState} />
      </div>
      <BuilderStepper step={step.id} progress={progress} onStep={go} />
      {sheet.error && <p className="text-destructive text-sm">{sheet.error}</p>}
      <div className="h-[min(40rem,calc(100dvh-14rem))] min-h-[24rem]">
        {framed ? <div className="bg-card h-full overflow-y-auto rounded-lg border shadow-xs">{body}</div> : body}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={index === 0} onClick={() => go(BUILDER_STEPS[index - 1].id)}>
          Back
        </Button>
        {next ? (
          <Button onClick={() => go(next.id)}>Next: {next.label}</Button>
        ) : (
          <Button onClick={() => navigate(characterPath(character.id))}>Finish</Button>
        )}
      </div>
    </div>
  )
}
