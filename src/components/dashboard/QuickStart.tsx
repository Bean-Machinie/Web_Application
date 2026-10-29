import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LayoutGroup, MotionConfig } from "motion/react"
import type { useCharacter } from "@/hooks/use-character"
import { useQuickBuild } from "@/hooks/use-quick-build"
import { characterPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { QUICK_KINDS } from "@/lib/quick-options"
import { RULES_FIELD } from "@/lib/quick-state"
import { applyQuickBuild } from "./quick-create"
import { QuickCharacterCard } from "./QuickCharacterCard"
import { QuickLearnDialog } from "./QuickLearnDialog"
import { QuickRulesDialog } from "./QuickRulesDialog"
import { QuickSentence } from "./QuickSentence"
import { QuickStrip } from "./QuickStrip"
import { QuickTopBar } from "./QuickTopBar"
import type { SheetActions } from "./character-actions"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character; actions: SheetActions; userId: string }

// "Start your story": a sentence to finish — "I’m a Human Fighter who was a Soldier" — with
// the options of the open bracket below it and the character taking shape beside it. Create
// character fills in the rest with suggestions.
export function QuickStart({ sheet, character, actions, userId }: Props) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const build = useQuickBuild(sheet, actions)
  const [learning, setLearning] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const ready = build.view.cls !== null && build.view.species !== null && build.view.background !== null
  const learnKind = QUICK_KINDS.find((kind) => kind === build.open?.kind)

  // The sheet reads the character afresh, so it opens once every value is saved.
  useEffect(() => {
    if (creating && sheet.saveState === "saved" && !sheet.error) navigate(characterPath(character.id), { state })
  }, [creating, sheet.saveState, sheet.error, navigate, character.id, state])

  const select = (id: string) => build.choose(build.open!.id, id)

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className="mx-auto flex w-[1100px] max-w-full flex-col gap-6">
          <QuickTopBar
            characterId={character.id}
            saveState={sheet.saveState}
            ready={ready}
            creating={creating && !sheet.error}
            onRules={() => setRulesOpen(true)}
            onCreate={() => setCreating(applyQuickBuild(actions, sheet))}
          />
          {sheet.error && <p className="text-destructive text-sm">{sheet.error}</p>}
          <div className="flex flex-col gap-6 min-[1000px]:flex-row min-[1000px]:items-start min-[1000px]:gap-10">
            <QuickCharacterCard
              character={character}
              userId={userId}
              view={build.view}
              shown={build.tried}
              base={build.base}
              onName={(name) => void sheet.edit("name", name)}
              onPortrait={(portrait) => sheet.edit("portrait", portrait)}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <QuickSentence slots={build.slots} openId={build.open?.id ?? null} onToggle={build.toggle} />
              <QuickStrip
                slot={build.open}
                onSelect={select}
                onLearn={setLearning}
                onPreview={(id) => build.preview(build.open!.id, id)}
              />
            </div>
          </div>
        </div>
        <QuickLearnDialog
          shown={learning && learnKind && build.open ? { slotId: build.open.id, kind: learnKind, id: learning } : null}
          actions={actions}
          onClose={() => setLearning(null)}
          onSelect={(id) => {
            setLearning(null)
            select(id)
          }}
        />
        <QuickRulesDialog open={rulesOpen} rules={build.rules} onClose={() => setRulesOpen(false)} onChange={(next) => actions.onValue(RULES_FIELD, next)} />
      </LayoutGroup>
    </MotionConfig>
  )
}
