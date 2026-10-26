import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SettingsIcon } from "@/components/icons/SettingsIcon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { useCharacter } from "@/hooks/use-character"
import { origins } from "@/lib/character-grants"
import { characterBuildPath, characterPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { chosenLine, KIND_TEXT, optionsOf, QUICK_KINDS } from "@/lib/quick-options"
import type { QuickKind } from "@/lib/quick-options"
import { APPROACH_FIELD, readRules, RULES_FIELD } from "@/lib/quick-state"
import { applyQuickBuild } from "./quick-create"
import { QuickApproach } from "./QuickApproach"
import { QuickCard } from "./QuickCard"
import { QuickIdentity } from "./QuickIdentity"
import { QuickOptionSheet } from "./QuickOptionSheet"
import { QuickPortrait } from "./QuickPortrait"
import { QuickRulesDialog } from "./QuickRulesDialog"
import { SaveIndicator } from "./SaveIndicator"
import type { SheetActions } from "./character-actions"
import { cn } from "@/lib/utils"

type Props = {
  sheet: ReturnType<typeof useCharacter>
  character: Character
  actions: SheetActions
  userId: string
  onPick: (kind: QuickKind) => void
}

// "Start your story": a class, a species and a background to choose, a portrait and a name,
// and Create character, which fills in the rest with suggestions.
export function QuickStart({ sheet, character, actions, userId, onPick }: Props) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [viewing, setViewing] = useState<QuickKind | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const rules = readRules(actions.values)
  const chosen = origins(actions)
  const ids: Record<QuickKind, string | undefined> = { class: chosen.cls?.id, species: chosen.species?.id, background: chosen.background?.id }
  const ready = QUICK_KINDS.every((kind) => ids[kind])

  // The sheet reads the character afresh, so it opens once every value is saved.
  useEffect(() => {
    if (creating && sheet.saveState === "saved" && !sheet.error) navigate(characterPath(character.id), { state })
  }, [creating, sheet.saveState, sheet.error, navigate, character.id, state])

  const create = () => setCreating(applyQuickBuild(actions, sheet))

  return (
    <div className="mx-auto flex w-[1100px] max-w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Start your story</h1>
          <p className="text-muted-foreground text-sm">Your character is a combination of a class, a species and a background.</p>
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator state={sheet.saveState} />
          <Button variant="ghost" asChild>
            <Link to={characterBuildPath(character.id, "class")}>Customize</Link>
          </Button>
          <Button variant="outline" size="icon" aria-label="Table rules" onClick={() => setRulesOpen(true)}>
            <HoverIcon icon={SettingsIcon} />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* A disabled button gets no pointer events, so the tooltip hangs on its wrapper. */}
              <span tabIndex={ready ? -1 : 0}>
                <Button disabled={!ready || (creating && !sheet.error)} onClick={create}>Create character</Button>
              </span>
            </TooltipTrigger>
            {!ready && <TooltipContent>Choose a class, a species and a background first.</TooltipContent>}
          </Tooltip>
        </div>
      </div>
      {sheet.error && <p className="text-destructive text-sm">{sheet.error}</p>}
      <div className="flex flex-col gap-6 min-[900px]:flex-row min-[900px]:items-start">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_KINDS.map((kind) => {
            const id = ids[kind]
            return (
              <div key={kind} className={cn("flex flex-col gap-4", kind === "background" && "sm:col-span-2")}>
                <QuickCard
                  kind={kind}
                  chosen={optionsOf(kind).find((option) => option.id === id) ?? null}
                  line={id ? chosenLine(kind, id, rules.level) : KIND_TEXT[kind].question}
                  onOptions={() => onPick(kind)}
                  onView={() => setViewing(kind)}
                  extra={kind === "species" && id ? <QuickIdentity key={id} speciesId={id} actions={actions} /> : undefined}
                />
                {kind === "class" && id && (
                  <QuickApproach
                    classId={id}
                    chosen={(actions.values[APPROACH_FIELD]?.value as string | null | undefined) ?? null}
                    onChoose={(approach) => actions.onValue(APPROACH_FIELD, approach)}
                  />
                )}
              </div>
            )
          })}
        </div>
        <QuickPortrait character={character} userId={userId} actions={actions} speciesId={ids.species ?? null} onName={(name) => void sheet.edit("name", name)} onPortrait={(portrait) => sheet.edit("portrait", portrait)} />
      </div>
      <QuickRulesDialog open={rulesOpen} rules={rules} onClose={() => setRulesOpen(false)} onChange={(next) => actions.onValue(RULES_FIELD, next)} />
      {QUICK_KINDS.map((kind) => (
        <QuickOptionSheet key={kind} kind={kind} id={viewing === kind ? (ids[kind] ?? null) : null} actions={actions} onClose={() => setViewing(null)} />
      ))}
    </div>
  )
}
