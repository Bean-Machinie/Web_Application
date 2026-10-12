import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = { visible: boolean; busy: boolean; onDiscard: () => void; onSave: () => void }

// Slides up over the foot of the content while there is something to save.
export function SettingsSaveBar({ visible, busy, onDiscard, onSave }: Props) {
  return (
    <div
      role="status"
      inert={!visible}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 transition-all duration-200 ease-out md:p-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="bg-popover pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl border py-2 pr-2 pl-4 shadow-lg">
        <span className="text-sm font-medium">You have unsaved changes</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} disabled={busy}>
            Discard
          </Button>
          <Button size="sm" onClick={onSave} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
