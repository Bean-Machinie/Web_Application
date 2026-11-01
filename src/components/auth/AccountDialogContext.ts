import { createContext } from "react"

export type AccountDialogState = {
  isGuest: boolean
  // Opens "Create a free account", saying what the guest was about to do ("publish a map").
  openFor: (action?: string) => void
  // Runs the action, or for a guest asks for an account instead.
  gate: (action: string, run: () => void) => void
}

export const AccountDialogContext = createContext<AccountDialogState>({
  isGuest: false,
  openFor: () => {},
  gate: (_action, run) => run(),
})
