import { User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALIGNMENTS } from "@/lib/character-templates/srd-5-2-1"
import { GLOSSARY } from "@/lib/character-templates/srd-5-2-1-glossary"
import { readLine } from "@/lib/character-values"
import type { Character } from "@/lib/characters"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import { BuilderRow } from "./BuilderRow"
import type { BuilderProps } from "./builder-types"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { InlineText } from "./InlineText"

// Step 5: the name, the portrait, a line on the concept and the alignment.
export function BuilderDetailsStep({ actions, sheet, character, userId }: BuilderProps) {
  const alignment = readLine(actions.values.alignment?.value)

  return (
    <BuilderDetail title="Details" intro="Who is your character?" page={GLOSSARY.alignment.page}>
      <div className="flex items-start gap-5">
        <div className="shrink-0 [--image-size:7rem]">
          <ImageFieldEditor
            value={character.portrait}
            label="Portrait"
            fallback={<User className="size-8" />}
            context={{ folder: userId, entryId: character.id }}
            onChange={(value) => sheet.edit("portrait", value as Character["portrait"])}
          />
        </div>
        <div className="grid min-w-0 flex-1 gap-1">
          <BuilderRow label="Name">
            <InlineText value={character.name} placeholder="Name" maxLength={80} onSave={(name) => void sheet.edit("name", name)} />
          </BuilderRow>
          <BuilderRow label="Concept">
            <InlineText value={character.concept} placeholder="A one-line concept" maxLength={140} allowEmpty onSave={(concept) => void sheet.edit("concept", concept)} />
          </BuilderRow>
          <BuilderRow label={<BuilderLabel glossaryKey="alignment" actions={actions}>Alignment</BuilderLabel>}>
            <Select value={alignment} onValueChange={(next) => actions.onValue("alignment", next)}>
              <SelectTrigger size="sm" aria-label="Alignment" className="w-56 max-w-full">
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BuilderRow>
        </div>
      </div>
    </BuilderDetail>
  )
}
