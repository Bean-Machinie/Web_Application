import { createContext, useContext, useEffect } from "react"

export type FormActions = { save: () => Promise<void>; discard: () => void }
export type FormStatus = { dirty: boolean; busy: boolean }

type Registry = {
  setActions: (actions: FormActions | null) => void
  setStatus: (status: FormStatus) => void
}

export const SettingsFormContext = createContext<Registry | null>(null)

// A tab with a form tells the window whether it has unsaved changes. The window owns the
// save bar and the "discard changes?" question, so the form only reports and obeys.
export function useSettingsForm({ dirty, busy, save, discard }: FormStatus & FormActions) {
  const { setActions, setStatus } = useContext(SettingsFormContext)!

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
    },
    [setActions, setStatus]
  )
}
