import { useContext } from "react"
import { AccountDialogContext } from "./AccountDialogContext"

export function useAccountDialog() {
  return useContext(AccountDialogContext)
}
