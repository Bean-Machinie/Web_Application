import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { isShown, sectionStarted, tabContents } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"
import type { CharacterFieldType, CharacterTemplate, TemplateSection, TemplateTab } from "@/lib/character-templates/types"
import { AbilityScoresDialog } from "./AbilityScoresDialog"
import { AddFieldMenu } from "./AddFieldMenu"
import type { SheetActions } from "./character-actions"
import { CharacterRows } from "./CharacterRows"
import { CharacterSection } from "./CharacterSection"
import { CharacterTextSection } from "./CharacterTextSection"
import { CharacterTiles } from "./CharacterTiles"

type Props = {
  template: CharacterTemplate
  tab: TemplateTab
  fields: SheetField[]
  actions: SheetActions
  // The sections the player opened before they had anything in them.
  opened: ReadonlySet<string>
  onOpen: (sectionId: string) => void
  onAdd: (type: CharacterFieldType) => void
}

// The line under a section's heading, once the number it mentions is known.
function captionOf(section: TemplateSection, actions: SheetActions) {
  const number = section.caption ? actions.derived[section.caption.field] : null
  return section.caption && number != null ? section.caption.text.replace("{n}", String(number)) : null
}

// One tab: the template's sections stacked as cards, each a compact card until set up.
// Then the fields that are in no section, and a quiet Add. With nothing at all, a short
// empty state with the way to add.
export function CharacterTabPanel({ template, tab, fields, actions, opened, onOpen, onAdd }: Props) {
  const contents = tabContents(template, tab, fields)
  const shown = (field: SheetField) => isShown(field, actions.byId, actions.values, actions.derived)
  const sections = contents.sections.map(({ section, fields: inSection }) => ({ section, fields: inSection.filter(shown) }))
  const loose = contents.loose.filter(shown)
  const plain = loose.filter((field) => field.type !== "text")
  const texts = loose.filter((field) => field.type === "text")

  if (sections.length === 0 && loose.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyTitle>{tab.empty}</EmptyTitle>
        </EmptyHeader>
        <AddFieldMenu onAdd={onAdd}>
          <Button variant="outline">
            <Plus />
            Add…
          </Button>
        </AddFieldMenu>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map(({ section, fields: inSection }) => (
        <CharacterSection
          key={section.id}
          section={section}
          count={inSection.length}
          open={opened.has(section.id) || sectionStarted(inSection, actions.values, actions.derived)}
          caption={captionOf(section, actions)}
          action={section.helper === "ability-scores" ? <AbilityScoresDialog actions={actions} /> : undefined}
          onOpen={() => onOpen(section.id)}
        >
          {section.layout === "grid" ? (
            <CharacterTiles fields={inSection} columns={section.columns ?? 3} actions={actions} />
          ) : (
            <CharacterRows fields={inSection} actions={actions} columns={section.columns} />
          )}
        </CharacterSection>
      ))}
      {plain.length > 0 && <CharacterRows fields={plain} actions={actions} />}
      {texts.map((field) => (
        <CharacterTextSection
          key={field.id}
          field={field}
          value={actions.values[field.id]?.value ?? null}
          fresh={field.id === actions.freshId}
          context={{ folder: actions.folder, entryId: actions.characterId }}
          onLabel={(label) => actions.onField(field, label, field.config)}
          onValue={(value) => actions.onValue(field.id, value, true)}
          onRemove={() => actions.onRemove(field.id)}
        />
      ))}
      <AddFieldMenu onAdd={onAdd}>
        <Button variant="ghost" size="sm" className="text-muted-foreground w-fit">
          <Plus />
          Add
        </Button>
      </AddFieldMenu>
    </div>
  )
}
