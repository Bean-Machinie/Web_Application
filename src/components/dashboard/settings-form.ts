import { createContext, useContext, useEffect } from "react"

export type FormActions = { save: () => Promise<void>; discard: () => void }
export type FormStatus = { dirty: boolean; busy: boolean }
export type Notice = { tone: "error" | "success"; text: string }

type Registry = {
  setActions: (actions: FormActions | null) => void
  setStatus: (status: FormStatus) => void
  setNotice: (notice: Notice | null) => void
}

export const SettingsFormContext = createContext<Registry | null>(null)

// How a form says what became of a save. The window shows it in the bar over the foot of the
// content, so it never moves the settings.
export function useSettingsNotice() {
  return useContext(SettingsFormContext)!.setNotice
}

// A tab with a form tells the window whether it has unsaved changes. The window owns the
// save bar and the "discard changes?" question, so the form only reports and obeys.
export function useSettingsForm({ dirty, busy, save, discard }: FormStatus & FormActions) {
  const { setActions, setStatus, setNotice } = useContext(SettingsFormContext)!

  // Every render, so the window never calls a save that has seen older input.
  useEffect(() => {
    setActions({ save, discard })
  })

  useEffect(() => {
    setStatus({ dirty, busy })
  }, [setStatus, dirty, busy])

  useEffect(
    () => () => {
      setActions(null)
      setStatus({ dirty: false, busy: false })
      setNotice(null)
    },
    [setActions, setStatus, setNotice]
  )
}
