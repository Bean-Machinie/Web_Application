import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useShortcutEditor } from "@/hooks/use-shortcut-editor"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import { SHORTCUT_GROUPS } from "@/lib/shortcut-actions"
import { anyChanged, getTable, resetAll, watch } from "@/lib/shortcut-store"
import { MapShortcutRow, MapShortcutStatic } from "./MapShortcutRow"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// Every key the builder answers to, grouped by what it is for, and where they
// are changed. Mouse gestures are shown as they are; they are not keys.
export function MapShortcutDialog({ open, onOpenChange }: Props) {
  const table = useSyncExternalStore(watch, getTable)
  const keyOf = useShortcutText()
  const editor = useShortcutEditor(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Press a shortcut to change it. {keyOf("help.toggle")} shows or hides this.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          {SHORTCUT_GROUPS.map(({ title, rows }) => (
            <section key={title} className="grid content-start gap-1.5">
              <h3 className="text-muted-foreground border-b pb-1 text-xs font-medium">{title}</h3>
              {rows.map((row) =>
                "action" in row ? (
                  <MapShortcutRow key={row.action} action={row.action} bindings={table[row.action]} editor={editor} />
                ) : (
                  <MapShortcutStatic key={row.label} label={row.label} text={row.keys.join(" + ")} />
                )
              )}
            </section>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-muted-foreground text-xs">
            Up to two keys for each. Ctrl+W, Ctrl+T and Ctrl+N belong to the browser and cannot be used.
          </p>
          <Button variant="outline" size="sm" disabled={!anyChanged()} onClick={resetAll}>
            Reset all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
