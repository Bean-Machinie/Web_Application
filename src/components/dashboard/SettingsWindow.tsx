import { useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettingsWindow } from "@/hooks/use-settings-window"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "./ConfirmDialog"
import { SettingsContent } from "./SettingsContent"
import { SettingsNav } from "./SettingsNav"
import { SettingsSaveBar } from "./SettingsSaveBar"
import { SettingsFormContext } from "./settings-form"
import type { FormActions, FormStatus } from "./settings-form"
import type { SettingsTab } from "./settings-tabs"

// Account settings as a window over the page, shown when the address has "?settings=" (see
// use-settings-window.ts). Mounted once, for every page that has a signed-in user.
export function SettingsWindow() {
  const { tab, open, close } = useSettingsWindow()
  const isMobile = useIsMobile()
  const active: SettingsTab = tab ?? "profile"
  const isOpen = tab !== null
  // On a small screen the list of tabs comes first and a tab slides in over it.
  const [showTab, setShowTab] = useState(false)
  const [status, setStatus] = useState<FormStatus>({ dirty: false, busy: false })
  const actions = useRef<FormActions | null>(null)
  const [pending, setPending] = useState<(() => void) | null>(null)
  const registry = useMemo(
    () => ({ setActions: (next: FormActions | null) => void (actions.current = next), setStatus }),
    []
  )

  const [wasOpen, setWasOpen] = useState(isOpen)
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    if (!isOpen) setShowTab(false)
  }

  // Anything that would throw away unsaved changes waits for an answer first.
  function guard(action: () => void) {
    if (status.dirty) setPending(() => action)
    else action()
  }

  function pick(next: SettingsTab) {
    if (next === active) return setShowTab(true)
    guard(() => {
      open(next)
      setShowTab(true)
    })
  }

  function confirmDiscard() {
    actions.current?.discard()
    pending?.()
    setPending(null)
  }

  return (
    <SettingsFormContext.Provider value={registry}>
      <Dialog open={isOpen} onOpenChange={(next) => !next && guard(close)}>
        <DialogContent
          className={cn(
            "top-0 left-0 h-dvh w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none p-0 sm:max-w-full",
            "md:top-1/2 md:left-1/2 md:h-[min(46rem,calc(100dvh-2rem))] md:max-w-5xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl",
            "md:flex md:flex-row"
          )}
        >
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <DialogDescription className="sr-only">Your account and workspace preferences.</DialogDescription>
          <div
            inert={isMobile && showTab}
            className={cn(
              "flex min-h-0 flex-col transition-transform duration-200 ease-out max-md:absolute max-md:inset-0 md:w-64 md:shrink-0",
              showTab && "max-md:-translate-x-1/4 max-md:opacity-0"
            )}
          >
            <SettingsNav tab={active} onPick={pick} />
          </div>
          <div
            inert={isMobile && !showTab}
            className={cn(
              "bg-popover relative flex min-h-0 min-w-0 flex-1 flex-col transition-transform duration-200 ease-out max-md:absolute max-md:inset-0",
              !showTab && "max-md:translate-x-full"
            )}
          >
            <SettingsContent tab={active} onBack={() => setShowTab(false)} />
            <SettingsSaveBar
              visible={status.dirty}
              busy={status.busy}
              onDiscard={() => actions.current?.discard()}
              onSave={() => void actions.current?.save()}
            />
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={pending !== null}
        title="Discard unsaved changes?"
        description="You have changes that haven't been saved. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        busy={false}
        error={null}
        onCancel={() => setPending(null)}
        onConfirm={confirmDiscard}
      />
    </SettingsFormContext.Provider>
  )
}
