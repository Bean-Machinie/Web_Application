import { useMatch } from "react-router-dom"

// The campaign the app is in, or undefined outside one.
export function useScopeId() {
  return useMatch("/app/c/:campaignId/*")?.params.campaignId
}
