import { useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { LayoutGroup, MotionConfig } from "motion/react"
import type { useCharacter } from "@/hooks/use-character"
import { useCompactScreen } from "@/hooks/use-compact-screen"
import { useAcceptSuggestion } from "@/hooks/use-accept-suggestion"
import { useQuickCreate } from "@/hooks/use-quick-create"
import { useQuickWorkspace } from "@/hooks/use-quick-workspace"
import { useShowSuggestions } from "@/hooks/use-show-suggestions"
import { useQuickBuild } from "@/hooks/use-quick-build"
import { characterPath, UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { SPECIES } from "@/lib/character-templates/srd-5-2-1"
import { needsAttention } from "@/lib/quick-attention"
import { QUICK_KINDS } from "@/lib/quick-options"
import { WORKSPACES } from "@/lib/quick-workspace"
import { BuilderShell } from "./BuilderShell"
import { changeCharacter } from "./character-change"
import { QuickAbilitiesCentre } from "./QuickAbilitiesCentre"
import { QuickBuildCentre } from "./QuickBuildCentre"
import { QuickLeftPanel } from "./QuickLeftPanel"
import { QuickRail } from "./QuickRail"
import { resetPicks } from "./quick-reset"
import { QuickCharacterCard } from "./QuickCharacterCard"
import { QuickLearnDialog } from "./QuickLearnDialog"
import { QuickRulesDialog } from "./QuickRulesDialog"
import { QuickSidePanel } from "./QuickSidePanel"
import { QuickStatusBar } from "./QuickStatusBar"
import { QuickPickPanel } from "./QuickPickPanel"
import { QuickTopBar } from "./QuickTopBar"
import type { SheetActions } from "./character-actions"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character; actions: SheetActions; userId: string }

// The quick builder as a full-screen page in the shared builder layout (see BuilderShell): a bar
// across the top, a rail of workspaces down the left with a panel beside it, the workspace in the
// middle, the character taking shape in a panel on the right, and a thin bar under it all. Build
// is the sentence and its options; Abilities is the six scores. Create character fills in the rest
// with suggestions.
export function QuickStart({ sheet, character, actions, userId }: Props) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const compact = useCompactScreen()
  const build = useQuickBuild(sheet, actions)
  // The pick whose panel is open is in the address, so a link can open it.
  const [params, setParams] = useSearchParams()
  const pick = params.get("pick")
  const setPick = (next: string | null) => setParams(next ? { pick: next } : {}, { replace: true })
  // Languages are words of the sentence, so the sentence lists them.
  const needs = needsAttention(actions).filter((need) => need.key !== "languages")
  const { workspace, setWorkspace, panelOpen, setPanelOpen, openPick, openSlot } = useQuickWorkspace(setPick, build.show)
  const [suggestions, setSuggestions] = useShowSuggestions()
  const [learning, setLearning] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const ready = build.view.cls !== null && build.view.species !== null && build.view.background !== null
  const learnKind = QUICK_KINDS.find((kind) => kind === build.open?.kind)
  const fresh = (state as { justCreated?: boolean } | null)?.justCreated === true

  const { busy, create } = useQuickCreate(sheet, actions, character)
  const select = (id: string) => build.choose(build.open!.id, id)
  useAcceptSuggestion(suggestions ? build.suggestion : null, select)

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
      onOpenSlot={openSlot}
      onPick={ready ? openPick : null}
      needs={needs}
      sizeChoice={!!SPECIES.find((option) => option.id === build.view.species)?.sizeChoice}
      compact={compact}
    />
  )

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <BuilderShell
          topBar={
            <QuickTopBar
              name={character.name === UNTITLED_CHARACTER ? "" : character.name}
              onRename={(name) => sheet.edit("name", name)}
              saveState={sheet.saveState}
              ready={ready}
              creating={busy}
              onBack={() => navigate(fresh ? "/app/library?section=characters" : characterPath(character.id))}
              onRules={() => setRulesOpen(true)}
              onCreate={create}
            />
          }
          banners={sheet.error && <p className="text-destructive border-b px-4 py-2 text-sm">{sheet.error}</p>}
          rail={<QuickRail workspace={workspace} onWorkspace={setWorkspace} />}
          railLabel="Workspaces"
          beforeLeave={async () => true}
          disabled={false}
          leftPanel={<QuickLeftPanel workspace={workspace} actions={actions} rules={build.rules} suggestions={suggestions} onSuggestions={setSuggestions} />}
          leftPanelName={WORKSPACES.find(({ id }) => id === workspace)!.panel}
          leftPanelOpen={panelOpen}
          onLeftPanelOpenChange={setPanelOpen}
          centre={
            workspace === "build" ? (
              <QuickBuildCentre
                build={build}
                actions={actions}
                card={compact && card}
                needs={needs}
                ready={ready}
                creating={busy}
                suggestions={suggestions}
                inset={panelOpen}
                onSelect={select}
                onLearn={setLearning}
                onPick={openPick}
                onCreate={create}
              />
            ) : (
              <QuickAbilitiesCentre actions={actions} rules={build.rules} inset={panelOpen} />
            )
          }
          statusBar={<QuickStatusBar rules={build.rules} onRules={() => setRulesOpen(true)} />}
          rightPanel={!compact && <QuickSidePanel overview={card} shown={build.tried} base={build.base} onPick={ready ? openPick : null} onOpenSlot={openSlot} onReset={ready ? (field, label) => resetPicks(actions, [field], label) : null} />}
        />
        <QuickPickPanel
          pickKey={pick}
          actions={actions}
          sheet={sheet}
          character={character}
          base={build.base}
          shown={build.tried}
          onPreview={build.tryPick}
          onClose={() => setPick(null)}
        />
        <QuickLearnDialog
          shown={learning && learnKind && build.open ? { slotId: build.open.id, kind: learnKind, id: learning } : null}
          actions={actions}
          onClose={() => setLearning(null)}
          onSelect={(id) => {
            setLearning(null)
            select(id)
          }}
        />
        <QuickRulesDialog open={rulesOpen} rules={build.rules} onClose={() => setRulesOpen(false)} onChange={(next) => changeCharacter(actions, { rules: next }, "Changed rules")} />
      </LayoutGroup>
    </MotionConfig>
  )
}
