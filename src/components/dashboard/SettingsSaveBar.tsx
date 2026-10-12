import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Notice } from "./settings-form"

type Props = {
  dirty: boolean
  busy: boolean
  notice: Notice | null
  onDiscard: () => void
  onSave: () => void
}

// Slides up over the foot of the content while there is something to save, and says how a
// save went. A failure outranks the unsaved changes; after a save, only the message is left.
export function SettingsSaveBar({ dirty, busy, notice, onDiscard, onSave }: Props) {
  const visible = dirty || notice !== null
  const failed = notice?.tone === "error"

  return (
    <div
      role={failed ? "alert" : "status"}
      inert={!visible}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 transition-all duration-200 ease-out md:p-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="bg-popover pointer-events-auto flex min-h-12 w-full max-w-2xl items-center justify-between gap-3 rounded-xl border py-2 pr-2 pl-4 shadow-lg">
        <span className={cn("text-sm font-medium", failed && "text-destructive", !dirty && !failed && "text-emerald-600 dark:text-emerald-500")}>
          {notice && (failed || !dirty) ? notice.text : "You have unsaved changes"}
        </span>
        {dirty && (
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={busy}>
              Discard
            </Button>
            <Button size="sm" onClick={onSave} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
