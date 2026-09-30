import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  submitLabel: string
  busy: boolean
  canSubmit: boolean
  onCancel: () => void
}

export function FormFooter({ submitLabel, busy, canSubmit, onCancel }: Props) {
  return (
    <div className="flex justify-end gap-3 pt-6 pb-6">
      <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
        Cancel
      </Button>
      <Button type="submit" disabled={busy || !canSubmit}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  )
}
