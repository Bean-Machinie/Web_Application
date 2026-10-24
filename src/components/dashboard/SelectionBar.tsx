import { HoverIcon } from "@/components/icons/HoverIcon"
import { XIcon } from "@/components/icons/XIcon"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { plural } from "@/lib/entry-selection"
import { FloatingBar } from "./FloatingBar"

type Props = {
  selection: EntrySelection
  // Says how far an action has got; the buttons wait meanwhile.
  progress: string | null
  // The actions, as buttons.
  children: ReactNode
}

// Slides up while anything is picked: how many, a way to take everything, the
// actions, and a button to let go.
export function SelectionBar({ selection, progress, children }: Props) {
  const busy = progress !== null

  return (
    <FloatingBar>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3">
        <span className="text-sm font-medium whitespace-nowrap">
          {progress ??
            (selection.everythingSelected
              ? `All ${plural(selection.total)} selected`
              : `${selection.count} selected`)}
        </span>
        {!busy && selection.canSelectEverything && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm whitespace-nowrap underline-offset-4 hover:underline"
            onClick={selection.selectEverything}
          >
            {`Select all ${plural(selection.total)}`}
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {children}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Clear selection"
          disabled={busy}
          onClick={selection.clear}
        >
          <HoverIcon icon={XIcon} />
        </Button>
      </div>
    </FloatingBar>
  )
}
