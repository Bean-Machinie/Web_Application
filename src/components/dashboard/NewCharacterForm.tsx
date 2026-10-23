import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCreateCharacter } from "@/hooks/use-create-character"
import { useTemplateChoice } from "@/hooks/use-template-choice"
import { TEMPLATE_CHOICES } from "@/lib/character-templates"

// Only mounted while the dialog is open, so it starts on the last system chosen.
export function NewCharacterForm({ onClose }: { onClose: () => void }) {
  const create = useCreateCharacter()
  const [choice, setChoice] = useTemplateChoice()
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    if (await create(choice)) onClose()
    else setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <DialogDescription className="sr-only">Choose the system the character sheet follows.</DialogDescription>
      <ToggleGroup
        type="single"
        variant="outline"
        value={choice}
        onValueChange={(next) => next && setChoice(next)}
        aria-label="System"
        className="grid w-full gap-2"
      >
        {TEMPLATE_CHOICES.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            className="data-[state=on]:border-primary data-[state=on]:ring-primary h-auto flex-col items-start gap-0.5 rounded-lg px-4 py-3 text-left data-[state=on]:bg-accent data-[state=on]:ring-1"
          >
            <span className="text-sm font-medium">{option.name}</span>
            <span className="text-muted-foreground text-sm font-normal">{option.description}</span>
            {option.licence && <span className="text-muted-foreground text-xs font-normal opacity-80">{option.licence}</span>}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Create
        </Button>
      </DialogFooter>
    </form>
  )
}
