import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  // Says where the adding has got to; null when nothing is being added.
  progress: string | null
  picked: number
  // How many entries are shown, and whether all of them are picked.
  shown: number
  allShownPicked: boolean
  onToggleAll: () => void
  onCancel: () => void
  onAdd: () => void
}

// Under the picker: what is picked, "Select all" for what is shown (the
// current kind and search), and the buttons.
export function AddFromLibraryFooter(props: Props) {
  const { progress, picked, shown, allShownPicked } = props
  const busy = progress !== null

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {progress ?? (picked === 0 ? "Pick the entries to add." : `${picked} selected`)}
        </span>
        {!busy && shown > 0 && (
          <Button variant="ghost" size="sm" onClick={props.onToggleAll}>
            {allShownPicked ? "Clear" : `Select all ${shown}`}
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={props.onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={props.onAdd} disabled={busy || picked === 0}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {picked > 0 ? `Add ${picked}` : "Add"}
        </Button>
      </div>
    </div>
  )
}
