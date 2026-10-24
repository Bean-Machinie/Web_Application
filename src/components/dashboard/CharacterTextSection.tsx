import { HoverIcon } from "@/components/icons/HoverIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import { Button } from "@/components/ui/button"
import type { SheetField } from "@/lib/character-sheet"
import { InlineText } from "./InlineText"
import { RichTextEditor } from "./RichTextEditor"

type Props = {
  field: SheetField
  value: unknown
  fresh: boolean
  context: { folder: string; entryId: string }
  onLabel: (label: string) => void
  onValue: (value: unknown) => void
  onRemove: () => void
}

// A text field: its name over the rich text editor, as the sections of an entry page.
// There is no @ picker: a character has no world to link into, so the editor here has
// none (see useMentionScope).
export function CharacterTextSection({ field, value, fresh, context, onLabel, onValue, onRemove }: Props) {
  return (
    <section className="group/field flex flex-col gap-2">
      <div className="flex h-7 items-center justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-medium">
          {field.custom ? (
            <InlineText value={field.label} placeholder="Name" maxLength={60} autoEdit={fresh} onSave={onLabel} className="font-medium" />
          ) : (
            field.label
          )}
        </h3>
        {field.custom && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/field:opacity-100"
            aria-label={`Remove ${field.label}`}
            onClick={onRemove}
          >
            <HoverIcon icon={Trash2Icon} />
          </Button>
        )}
      </div>
      <RichTextEditor value={value} label={field.label} placeholder="Write here…" context={context} onChange={onValue} />
    </section>
  )
}
