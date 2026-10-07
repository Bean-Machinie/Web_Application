import { Lock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isFixed } from "@/hooks/use-shortcut-editor"
import type { ShortcutEditor } from "@/hooks/use-shortcut-editor"
import { ACTIONS } from "@/lib/shortcut-actions"
import type { ActionId } from "@/lib/shortcut-actions"
import { bindingText } from "@/lib/shortcut-keys"
import type { Binding } from "@/lib/shortcut-keys"
import { MAX_BINDINGS, isChanged, resetAction } from "@/lib/shortcut-store"
import { MapShortcutField } from "./MapShortcutField"

const LABELS = new Map(ACTIONS.map(({ id, label }) => [id, label]))

type Props = { action: ActionId; bindings: Binding[]; editor: ShortcutEditor }

// What cannot be set, in the place of a field: a fixed key, or a mouse gesture.
export function MapShortcutStatic({ label, text, locked }: { label: string; text: string; locked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-[13px]">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="bg-muted/40 text-muted-foreground flex h-7 w-32 items-center justify-between rounded-md px-2 text-xs">
          {text}
          {locked && <Lock className="size-3" aria-label="Fixed" />}
        </span>
        {/* The room a row of fields keeps for its reset button, so they line up. */}
        <span className="size-6 shrink-0" />
      </span>
    </div>
  )
}

// A row of the shortcuts: what it is for, and its key as a field to press. A
// second key has a field of its own, beside the first; it is added from the row, and
// shown only once there is one. A key another action has is asked about under the row.
export function MapShortcutRow({ action, bindings, editor }: Props) {
  const label = LABELS.get(action)!
  const { target, conflict } = editor
  const here = target?.action === action ? target.slot : null
  const owner = conflict ? LABELS.get(conflict.owner) : null

  if (isFixed(action)) {
    return <MapShortcutStatic label={label} text={bindings.map(bindingText).join(" or ")} locked />
  }

  // An action with no key still has a field, to set one.
  const slots: (Binding | undefined)[] = bindings.length === 0 ? [undefined] : bindings
  const adding = here !== null && here === bindings.length && bindings.length > 0

  return (
    <div className="group/row grid gap-1">
      <div className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[13px]">{label}</span>
          {bindings.length > 0 && bindings.length < MAX_BINDINGS && here === null && (
            <button
              type="button"
              aria-label={`Add a second shortcut for ${label}`}
              onClick={() => editor.start(action, 1)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-xs opacity-0 outline-none transition-opacity group-has-[:focus-visible]/row:opacity-100 group-hover/row:opacity-100 focus-visible:ring-2"
            >
              Add second key
            </button>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          {slots.map((binding, slot) => (
            <MapShortcutField
              key={binding ? bindingText(binding) : "empty"}
              binding={binding}
              action={label}
              waiting={here === slot}
              onEdit={() => editor.start(action, slot)}
              onClear={() => editor.clear(action, slot)}
            />
          ))}
          {adding && <MapShortcutField action={label} waiting onEdit={() => {}} onClear={() => {}} />}
          <span className="flex size-6 shrink-0 items-center justify-center">
            {isChanged(action) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Reset ${label} to its default`}
                    onClick={() => resetAction(action)}
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to default</TooltipContent>
              </Tooltip>
            )}
          </span>
        </span>
      </div>
      {here !== null && editor.message && <p className="text-destructive text-xs">{editor.message}</p>}
      {here !== null && conflict && owner && (
        <div className="bg-muted/50 flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs">
          <span>
            <b className="font-medium">{bindingText(conflict.binding)}</b> is used by {owner}
            {isFixed(conflict.owner) && " and cannot be changed"}.
          </span>
          <span className="flex shrink-0 gap-1">
            {!isFixed(conflict.owner) && (
              <Button size="xs" onClick={editor.takeOver}>
                Replace
              </Button>
            )}
            <Button size="xs" variant="ghost" onClick={editor.cancel}>
              Cancel
            </Button>
          </span>
        </div>
      )}
    </div>
  )
}
