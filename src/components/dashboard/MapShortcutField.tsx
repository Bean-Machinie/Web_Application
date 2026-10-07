import { X } from "lucide-react"
import { bindingParts } from "@/lib/shortcut-keys"
import type { Binding } from "@/lib/shortcut-keys"
import { cn } from "@/lib/utils"

type Props = {
  // Empty when the action has no key.
  binding?: Binding
  // What it is the shortcut for, for those who cannot see it.
  action: string
  // Waiting for the key to be pressed.
  waiting: boolean
  onEdit: () => void
  onClear: () => void
}

// A shortcut as a field, like a setting: it shows the key as it is, and pressing
// it waits for a new one. A cross inside it, shown when it is pointed at, clears it.
export function MapShortcutField({ binding, action, waiting, onEdit, onClear }: Props) {
  const text = binding ? bindingParts(binding).join(" + ") : null

  return (
    <span className="group/field relative flex w-32 shrink-0">
      <button
        type="button"
        data-capturing={waiting ? "" : undefined}
        aria-label={text ? `Change ${text.replaceAll(" ", "")} for ${action}` : `Set a shortcut for ${action}`}
        onClick={onEdit}
        className={cn(
          "bg-background hover:border-foreground/30 focus-visible:ring-ring h-7 w-full truncate rounded-md border px-2 text-left text-xs outline-none transition-colors focus-visible:ring-2",
          binding && !waiting && "pr-6",
          waiting && "border-ring ring-ring/40 text-muted-foreground animate-pulse ring-2"
        )}
      >
        {waiting ? "Press keys…" : (text ?? <span className="text-muted-foreground">Not set</span>)}
      </button>
      {binding && !waiting && (
        <button
          type="button"
          aria-label={`Clear ${text!.replaceAll(" ", "")} for ${action}`}
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-1 my-auto hidden size-5 items-center justify-center rounded-sm group-has-[:focus-visible]/field:flex group-hover/field:flex"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}
