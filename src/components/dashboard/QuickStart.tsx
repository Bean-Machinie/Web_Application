import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LayoutGroup, MotionConfig } from "motion/react"
import type { useCharacter } from "@/hooks/use-character"
import { useCompactScreen } from "@/hooks/use-compact-screen"
import { useQuickBuild } from "@/hooks/use-quick-build"
import { characterPath, UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { QUICK_KINDS } from "@/lib/quick-options"
import { RULES_FIELD } from "@/lib/quick-state"
import { applyQuickBuild } from "./quick-create"
import { QuickCharacterCard } from "./QuickCharacterCard"
import { QuickLearnDialog } from "./QuickLearnDialog"
import { MapAccount } from "./MapAccount"
import { QuickRulesDialog } from "./QuickRulesDialog"
import { QuickSidePanel } from "./QuickSidePanel"
import { QuickStatusBar } from "./QuickStatusBar"
import { QuickToolStrip } from "./QuickToolStrip"
import { QuickSentence } from "./QuickSentence"
import { QuickPicker } from "./QuickPicker"
import { QuickReview } from "./QuickReview"
import { QuickTopBar } from "./QuickTopBar"
import type { SheetActions } from "./character-actions"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character; actions: SheetActions; userId: string }

// The quick builder as a full-screen page, laid out like the map builder: a bar across the top,
// a strip of choices down the left, the sentence and its options in the middle, the character
// taking shape in a panel on the right, and a thin bar under it all. Create character fills
// in the rest with suggestions.
export function QuickStart({ sheet, character, actions, userId }: Props) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const compact = useCompactScreen()
  const build = useQuickBuild(sheet, actions)
  const [learning, setLearning] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const ready = build.view.cls !== null && build.view.species !== null && build.view.background !== null
  const learnKind = QUICK_KINDS.find((kind) => kind === build.open?.kind)
  const fresh = (state as { justCreated?: boolean } | null)?.justCreated === true

  // The sheet reads the character afresh, so it opens once every value is saved.
  useEffect(() => {
    if (creating && sheet.saveState === "saved" && !sheet.error) navigate(characterPath(character.id), { state })
  }, [creating, sheet.saveState, sheet.error, navigate, character.id, state])

  const busy = creating && !sheet.error
  const create = () => setCreating(applyQuickBuild(actions, sheet))
  const select = (id: string) => build.choose(build.open!.id, id)

  const card = (
    <QuickCharacterCard
      character={character}
      userId={userId}
      view={build.view}
      slots={build.slots}
      shown={build.tried}
      base={build.base}
      onName={(name) => void sheet.edit("name", name)}
      onPortrait={(portrait) => sheet.edit("portrait", portrait)}
      onOpenSlot={build.show}
      compact={compact}
    />
  )

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className="bg-background fixed inset-0 z-50 flex flex-col">
          <QuickTopBar
            name={character.name === UNTITLED_CHARACTER ? "New character" : character.name}
            characterId={character.id}
            saveState={sheet.saveState}
            ready={ready}
            creating={busy}
            onBack={() => navigate(fresh ? "/app/library?section=characters" : characterPath(character.id))}
            onRules={() => setRulesOpen(true)}
            onCreate={create}
          />
          {sheet.error && <p className="text-destructive border-b px-4 py-2 text-sm">{sheet.error}</p>}
          <div className="flex min-h-0 flex-1">
            {!compact && <QuickToolStrip open={build.open} ready={ready} account={<MapAccount expanded={false} beforeLeave={async () => true} />} onShow={build.show} />}
            <main className="min-w-0 flex-1 overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
              <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 min-[1000px]:p-8">
                <QuickSentence slots={build.slots} openId={build.open?.id ?? null} onToggle={build.toggle} />
                {compact && card}
                <QuickPicker
                  slot={build.open}
                  previewId={build.previewId}
                  actions={actions}
                  idle={
                    ready ? (
                      <QuickReview characterId={character.id} view={build.view} slots={build.slots} rules={build.rules} creating={busy} onOpen={build.show} onCreate={create} />
                    ) : (
                      <p className="text-muted-foreground text-sm">Choose a word in the sentence to see its options.</p>
                    )
                  }
                  onSelect={select}
                  onLearn={setLearning}
                  onPreview={(id) => build.preview(build.open!.id, id)}
                />
              </div>
            </main>
            {!compact && <QuickSidePanel>{card}</QuickSidePanel>}
          </div>
          <QuickStatusBar rules={build.rules} onRules={() => setRulesOpen(true)} />
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
