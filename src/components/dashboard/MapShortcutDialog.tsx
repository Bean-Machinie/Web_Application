import { useSyncExternalStore } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ACTIONS, SHORTCUT_GROUPS } from "@/lib/shortcut-actions"
import { bindingParts } from "@/lib/shortcut-keys"
import { getTable, watch } from "@/lib/shortcut-store"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

const LABELS = new Map(ACTIONS.map(({ id, label }) => [id, label]))

function Keys({ parts }: { parts: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {parts.map((part) => (
        <kbd
          key={part}
          className="bg-muted text-muted-foreground min-w-5 rounded border px-1.5 py-0.5 text-center font-sans text-[11px] leading-none"
        >
          {part}
        </kbd>
      ))}
    </span>
  )
}

// Every key the builder answers to, grouped by what it is for.
export function MapShortcutDialog({ open, onOpenChange }: Props) {
  const table = useSyncExternalStore(watch, getTable)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Press ? or Ctrl+/ to show or hide this.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {SHORTCUT_GROUPS.map(({ title, rows }) => (
            <section key={title} className="grid content-start gap-1.5">
              <h3 className="text-muted-foreground text-xs font-medium">{title}</h3>
              {rows.map((row) => {
                const label = "action" in row ? LABELS.get(row.action) : row.label
                const alternatives = "action" in row ? table[row.action].map(bindingParts) : [row.keys]
                return (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[13px]">{label}</span>
                    <span className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
                      {alternatives.map((parts, index) => (
                        <span key={parts.join("+")} className="flex items-center gap-1.5">
                          {index > 0 && <span className="text-muted-foreground text-xs">or</span>}
                          <Keys parts={parts} />
                        </span>
                      ))}
                    </span>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
