import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { rulesPath } from "@/lib/rules-terms"

// Opens a rules term in the library's SRD.
export function useRuleLink() {
  const navigate = useNavigate()
  return useCallback((termId: string) => navigate(rulesPath(termId)), [navigate])
}
