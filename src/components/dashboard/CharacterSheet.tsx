import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { useCharacter } from "@/hooks/use-character"
import { isPinned, isShown, NEW_FIELD_LABEL, profileFields } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import { isEmptyValue } from "@/lib/character-values"
import type { CharacterFieldType } from "@/lib/character-templates/types"
import { deleteCharacter } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { errorMessage } from "@/lib/campaigns"
import { noticeFor, noticePath } from "@/lib/legal-notices"
import { ConfirmDialog } from "./ConfirmDialog"
import { CharacterMenu } from "./CharacterMenu"
import { CharacterPill } from "./CharacterPill"
import { CharacterProfile } from "./CharacterProfile"
import { QuickBanner } from "./QuickBanner"
import { CharacterRows } from "./CharacterRows"
import { CharacterSummary } from "./CharacterSummary"
import { CharacterTabPanel } from "./CharacterTabPanel"
import { QuickToFinish } from "./QuickToFinish"
import { sheetActions } from "./sheet-actions"
import { SaveIndicator } from "./SaveIndicator"

type Props = {
  sheet: ReturnType<typeof useCharacter>
  character: Character
  fresh: boolean
}

// The sheet in two columns that scroll with the page, about 1280px in all: the profile
// on the left (portrait, name, concept, pills, identity), and on the right the tabs with
// the open tab's sections stacked under them. The open tab is in the address. Under
// 1000px the profile is above the sheet.
export function CharacterSheet({ sheet, character, fresh }: Props) {
  const navigate = useNavigate()
  const userId = useAuth().session!.user.id
  const [params, setParams] = useSearchParams()
  const [freshField, setFreshField] = useState<string | null>(null)
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const { template, fields, values } = sheet
  const gameNotice = noticeFor(template!.id, template!.version)
  const tabs = template!.tabs
  const tab = tabs.find((candidate) => candidate.id === params.get("tab")) ?? tabs[0]

  async function remove() {
    try {
      await deleteCharacter(character.id, character.portrait?.path)
      navigate("/app/library?section=characters")
    } catch (error) {
      setFailure(errorMessage(error))
      setDeleting(false)
    }
  }

  // A pill the template pinned waits for a value; one the player pinned is always there.
  const showsPill = (field: SheetField) =>
    !field.derived &&
    field.type !== "list" &&
    field.type !== "text" &&
    field.type !== "line" &&
    field.type !== "choice" &&
    field.type !== "attacks" &&
    isPinned(field, values) &&
    (values[field.id]?.pinned === true || !isEmptyValue(field.type, values[field.id]?.value))

  const actions = sheetActions(sheet, character.id, userId, freshField)

  const pills = fields.filter(showsPill).map((field) => (
    <CharacterPill key={field.id} field={field} actions={actions} />
  ))
  const identity = profileFields(template!, fields).filter((field) => isShown(field, actions.byId, values, sheet.derived))

  return (
    <div className="mx-auto flex w-[1280px] max-w-full flex-col gap-6 min-[1000px]:flex-row min-[1000px]:items-start min-[1000px]:gap-8">
      <CharacterProfile
        character={character}
        userId={userId}
        fresh={fresh}
        onName={async (name) => void (await sheet.edit("name", name))}
        onConcept={(concept) => void sheet.edit("concept", concept)}
        onPortrait={(portrait) => sheet.edit("portrait", portrait)}
        template={gameNotice}
        pills={pills.length > 0 ? pills : null}
        identity={
          template!.builder ? (
            <CharacterSummary actions={actions} />
          ) : (
            identity.length > 0 && <CharacterRows fields={identity} actions={actions} narrow />
          )
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* The tabs, and at the right end of their row the save state and the menu. */}
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab.id} onValueChange={(next) => setParams({ tab: next }, { replace: true })}>
            <TabsList variant="line" className="h-10 justify-start">
              {tabs.map((candidate) => (
                <TabsTrigger key={candidate.id} value={candidate.id} className="flex-none px-3">
                  {candidate.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex shrink-0 items-center gap-2">
            <SaveIndicator state={sheet.saveState} />
            <CharacterMenu aboutPath={gameNotice && noticePath(gameNotice.id)} onDelete={() => setDeleting(true)} />
          </div>
        </div>
        {template!.builder && (
          <QuickBanner characterId={character.id} context={{ values, derived: sheet.derived, byId: new Map(fields.map((field) => [field.id, field])) }} />
        )}
        {template!.builder && <QuickToFinish character={character} fields={fields} values={values} derived={sheet.derived} />}
        {(sheet.error || failure) && <p className="text-destructive text-sm">{sheet.error ?? failure}</p>}
        <CharacterTabPanel
          key={tab.id}
          template={template!}
          tab={tab}
          fields={fields}
          actions={actions}
          opened={opened}
          onOpen={(sectionId) => setOpened((old) => new Set(old).add(sectionId))}
          onAdd={async (type: CharacterFieldType) => setFreshField(await sheet.addField(tab.id, type, NEW_FIELD_LABEL[type]))}
        />
      </div>
      <ConfirmDialog
        open={deleting}
        title={`Delete ${character.name}?`}
        description="This permanently removes the character. It cannot be undone."
        confirmLabel="Delete character"
        busy={false}
        error={null}
        onCancel={() => setDeleting(false)}
        onConfirm={remove}
      />
    </div>
  )
}
