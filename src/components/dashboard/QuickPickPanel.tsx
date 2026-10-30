import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { useCharacter } from "@/hooks/use-character"
import { origins } from "@/lib/character-grants"
import { countOf } from "@/lib/character-rules-checks"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { readPicks } from "@/lib/character-values"
import type { Character } from "@/lib/characters"
import { pickInfo } from "@/lib/pick-info"
import type { PickInfo } from "@/lib/pick-info"
import { pickOptions } from "@/lib/pick-options"
import type { CardModel } from "@/lib/quick-card"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"
import { PickAbilities } from "./PickAbilities"
import { PickDetails } from "./PickDetails"
import { PickEquipment } from "./PickEquipment"
import { PickList } from "./PickList"
import { PickOriginFeat } from "./PickOriginFeat"
import { QuickCardNumbers } from "./QuickCardNumbers"

type Values = Record<string, unknown>
type Props = {
  pickKey: string | null
  actions: SheetActions
  sheet: ReturnType<typeof useCharacter>
  character: Character
  base: CardModel
  shown: CardModel
  // The values the card should try on, or null.
  onPreview: (values: Values | null) => void
  onClose: () => void
}

const SIZES = [
  { id: "medium", label: "Medium", note: "About 4–7 ft tall." },
  { id: "small", label: "Small", note: "About 2–4 ft tall." },
]

// The fields a pick holds and what is stored in them now.
function currentOf(info: PickInfo, actions: SheetActions): Values {
  const stored = (field: string) => actions.values[field]?.value ?? null
  const fields = info.key === "abilities" ? [...ABILITIES.map(([id]) => id), "ability-increase"] : info.key === "equipment" ? ["equipment-class", "equipment-background"] : info.decl ? [info.decl.field] : [info.key]
  return Object.fromEntries(fields.map((field) => [field, stored(field)]))
}

function PanelBody({ info, actions, sheet, character, base, shown, onPreview, onClose }: Props & { info: PickInfo }) {
  const [draft, setDraft] = useState<Values>(() => currentOf(info, actions))
  const [hover, setHover] = useState<Values | null>(null)
  const current = currentOf(info, actions)
  const changed = JSON.stringify(draft) !== JSON.stringify(current)
  const live = info.key === "details"

  // What the card tries on: the option under the pointer, else the draft if it differs.
  useEffect(() => onPreview(hover ?? (changed ? draft : null)), [hover, changed, draft, onPreview])
  useEffect(() => () => onPreview(null), [onPreview])

  const clean = (values: Values) => Object.fromEntries(Object.entries(values).map(([field, value]) => [field, Array.isArray(value) && value.length === 0 ? null : value]))
  function save() {
    changeCharacter(actions, { pick: { values: clean(draft) } }, `Updated ${info.title}`)
    onClose()
  }
  function reset() {
    changeCharacter(actions, { pick: { values: Object.fromEntries(Object.keys(current).map((field) => [field, null])), reset: true } }, `Reset ${info.title}`)
    onClose()
  }

  const decl = info.decl
  const field = decl?.field ?? info.key
  const list = (options: Parameters<typeof PickList>[0]["options"], count: number, value: string[]) => (
    <PickList options={options} value={value} count={count} label={info.title} onChange={(next) => setDraft({ [field]: next.length > 0 ? (info.key === "size" ? next[0] : next) : null })} onPreview={(next) => setHover(next ? { [field]: info.key === "size" ? next[0] : next } : null)} />
  )

  const body =
    info.key === "abilities" ? <PickAbilities draft={draft} onDraft={setDraft} actions={actions} /> :
    info.key === "equipment" ? <PickEquipment draft={draft} onDraft={setDraft} actions={actions} /> :
    info.key === "details" ? <PickDetails actions={actions} character={character} onConcept={(concept) => void sheet.edit("concept", concept)} /> :
    info.key === "origin-feat" ? <PickOriginFeat draft={draft} onDraft={setDraft} onPreview={setHover} actions={actions} /> :
    info.key === "size" ? list(SIZES, 1, draft.size ? [draft.size as string] : []) :
    decl ? list(pickOptions(actions, decl), countOf(decl), readPicks(draft[decl.field])) : null

  return (
    <>
      <SheetHeader className="gap-1.5 border-b pr-12">
        <SheetTitle className="flex items-center gap-2 text-base">
          {info.title}
          {info.source && <Badge variant="secondary">{info.source}</Badge>}
        </SheetTitle>
        <SheetDescription>{info.help}</SheetDescription>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
        {!live && <QuickCardNumbers shown={shown} base={base} />}
        {body}
      </div>
      <SheetFooter className="flex-row items-center justify-between border-t">
        {live ? <span /> : <Button variant="ghost" onClick={reset}>Reset to suggested</Button>}
        <div className="flex gap-2">
          {live ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button disabled={!changed} onClick={save}>Save</Button>
            </>
          )}
        </div>
      </SheetFooter>
    </>
  )
}

// The side panel for one pick: what it is and who asks for it, its options as rows with the
// current value chosen, suggestions included, and Reset to suggested, Cancel and Save. Save goes
// through the character rules like every other change, so the toast and Undo are the same.
export function QuickPickPanel(props: Props) {
  const info = props.pickKey ? pickInfo(props.actions, props.pickKey) : null
  const { cls, species, background } = origins(props.actions)
  // Nothing to pick until the three origins are chosen.
  const open = !!info && !!cls && !!species && !!background

  return (
    <Sheet open={open} onOpenChange={(next) => !next && props.onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-[440px]">{info && open && <PanelBody key={info.key} {...props} info={info} />}</SheetContent>
    </Sheet>
  )
}
