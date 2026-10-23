import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { isPinned } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { CharacterFieldType, FieldConfig, TemplateTab } from "@/lib/character-templates/types"
import type { StoredValue } from "@/lib/characters"
import { AddFieldMenu } from "./AddFieldMenu"
import { CharacterFieldRow } from "./CharacterFieldRow"
import { CharacterFieldValue } from "./CharacterFieldValue"
import { CharacterTextSection } from "./CharacterTextSection"

type Props = {
  characterId: string
  folder: string
  tab: TemplateTab
  fields: SheetField[]
  values: Record<string, StoredValue>
  // The field just added, whose name is waiting to be typed.
  freshId: string | null
  onAdd: (type: CharacterFieldType) => void
  onValue: (fieldId: string, value: unknown, typing?: boolean) => void
  onField: (field: SheetField, label: string, config: FieldConfig) => void
  onPin: (fieldId: string, pinned: boolean) => void
  onRemove: (fieldId: string) => void
}

// One tab. With nothing in it, a short empty state with the way to add; otherwise the
// facts card (stats, resources, tracks, lists) and the text sections below it, and a quiet
// Add after them.
export function CharacterTabPanel(props: Props) {
  const { tab, fields, values } = props
  const add = (
    <AddFieldMenu onAdd={props.onAdd}>
      <Button variant="outline">
        <Plus />
        Add…
      </Button>
    </AddFieldMenu>
  )

  if (fields.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyTitle>{tab.empty}</EmptyTitle>
        </EmptyHeader>
        {add}
      </Empty>
    )
  }

  const facts = fields.filter((field) => field.type !== "text")
  const texts = fields.filter((field) => field.type === "text")
  const show = (field: SheetField) => values[field.id]?.value ?? null

  return (
    <div className="flex flex-col gap-4">
      {facts.length > 0 && (
        <dl className="bg-card flex min-w-0 flex-col divide-y rounded-lg border shadow-xs">
          {facts.map((field) => (
            <CharacterFieldRow
              key={field.id}
              field={field}
              pinned={isPinned(field, values)}
              fresh={field.id === props.freshId}
              onLabel={(label) => props.onField(field, label, field.config)}
              onPin={(pinned) => props.onPin(field.id, pinned)}
              onRemove={() => props.onRemove(field.id)}
            >
              <CharacterFieldValue
                field={field}
                value={show(field)}
                onValue={(value) => props.onValue(field.id, value)}
                onLength={(length) => props.onField(field, field.label, { ...field.config, length })}
              />
            </CharacterFieldRow>
          ))}
        </dl>
      )}
      {texts.map((field) => (
        <CharacterTextSection
          key={field.id}
          field={field}
          value={show(field)}
          fresh={field.id === props.freshId}
          context={{ folder: props.folder, entryId: props.characterId }}
          onLabel={(label) => props.onField(field, label, field.config)}
          onValue={(value) => props.onValue(field.id, value, true)}
          onRemove={() => props.onRemove(field.id)}
        />
      ))}
      <AddFieldMenu onAdd={props.onAdd}>
        <Button variant="ghost" size="sm" className="text-muted-foreground w-fit">
          <Plus />
          Add
        </Button>
      </AddFieldMenu>
    </div>
  )
}
