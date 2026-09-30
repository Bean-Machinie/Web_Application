import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/campaigns"

type Props = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  initialName?: string
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

function NameForm({
  description,
  submitLabel,
  initialName = "",
  onSubmit,
  onClose,
}: Omit<Props, "open" | "title">) {
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSubmit(name.trim())
      onClose()
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  const unchanged = name.trim() === initialName
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogDescription className="sr-only">{description}</DialogDescription>
      <Input
        aria-label="Name"
        autoFocus
        autoComplete="off"
        maxLength={80}
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={busy}
      />
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy || name.trim() === "" || unchanged}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

// The form inside only exists while the dialog is open, so it starts fresh
// every time.
export function EntryNameDialog({ open, title, onClose, ...form }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <NameForm {...form} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
