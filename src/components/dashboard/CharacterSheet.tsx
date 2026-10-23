import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { useCharacter } from "@/hooks/use-character"
import { isPinned, NEW_FIELD_LABEL } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { CharacterFieldType } from "@/lib/character-templates/types"
import type { Character } from "@/lib/characters"
import { deleteCharacter } from "@/lib/characters"
import { errorMessage } from "@/lib/campaigns"
import { ConfirmDialog } from "./ConfirmDialog"
import { CharacterHeader } from "./CharacterHeader"
import { CharacterPill } from "./CharacterPill"
import { CharacterTabPanel } from "./CharacterTabPanel"
import { SaveIndicator } from "./SaveIndicator"

type Props = {
  sheet: ReturnType<typeof useCharacter>
  character: Character
  fresh: boolean
}

// The sheet: a header that stays on screen (portrait, name, concept, pinned pills) over
// the tabs, and below them the one tab that is open. The open tab is in the address.
export function CharacterSheet({ sheet, character, fresh }: Props) {
  const navigate = useNavigate()
  const userId = useAuth().session!.user.id
  const [params, setParams] = useSearchParams()
  const [freshField, setFreshField] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const { template, fields, values } = sheet
  const tabs = template!.tabs
  const tab = tabs.find((candidate) => candidate.id === params.get("tab")) ?? tabs[0]

  const lengthOf = (field: SheetField) => (length: number) =>
    sheet.changeField(field.id, field.label, { ...field.config, length })

  async function remove() {
    try {
      await deleteCharacter(character.id, character.portrait?.path)
      navigate("/app/library?section=characters")
    } catch (error) {
      setFailure(errorMessage(error))
      setDeleting(false)
    }
  }

  const pills = fields
    .filter((field) => field.type !== "list" && field.type !== "text" && isPinned(field, values))
    .map((field) => (
      <CharacterPill
        key={field.id}
        field={field}
        value={values[field.id]?.value ?? null}
        onValue={(value) => sheet.setValue(field.id, value)}
        onLength={lengthOf(field)}
      />
    ))

  return (
    <div className="-m-4 flex flex-col md:-m-6">
      <div className="bg-background sticky top-(--header-height) z-30 border-b">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-4 md:px-6 md:pt-6">
          <CharacterHeader
            character={character}
            userId={userId}
            fresh={fresh}
            onName={async (name) => void (await sheet.edit("name", name))}
            onConcept={(concept) => void sheet.edit("concept", concept)}
            onPortrait={(portrait) => sheet.edit("portrait", portrait)}
            pills={pills.length > 0 ? pills : null}
            aside={
              <>
                <SaveIndicator state={sheet.saveState} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Character options">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
                      <Trash2 />
                      Delete character
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />
          <Tabs value={tab.id} onValueChange={(next) => setParams({ tab: next }, { replace: true })}>
            <TabsList variant="line" className="h-10 w-full justify-start">
              {tabs.map((candidate) => (
                <TabsTrigger key={candidate.id} value={candidate.id} className="flex-none px-3">
                  {candidate.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4 md:px-6 md:py-6">
        {(sheet.error || failure) && <p className="text-destructive mb-4 text-sm">{sheet.error ?? failure}</p>}
        <CharacterTabPanel
          key={tab.id}
          characterId={character.id}
          folder={userId}
          tab={tab}
          fields={fields.filter((field) => field.tab === tab.id)}
          values={values}
          freshId={freshField}
          onAdd={async (type: CharacterFieldType) => setFreshField(await sheet.addField(tab.id, type, NEW_FIELD_LABEL[type]))}
          onValue={sheet.setValue}
          onField={(field, label, config) => sheet.changeField(field.id, label, config)}
          onPin={(fieldId, pinned) => sheet.setPinned(fieldId, pinned)}
          onRemove={(fieldId) => sheet.removeField(fieldId)}
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
