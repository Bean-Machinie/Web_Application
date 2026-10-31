import { useAuth } from "@/auth/useAuth"
import { useStoredValue } from "./use-stored-value"

export type WorldViewMode = "list" | "grid" | "graph"

const read = (text: string | null): WorldViewMode => (text === "grid" || text === "graph" ? text : "list")

// Remembered per user, in this browser.
export const useWorldViewMode = () => useStoredValue(`world-view:${useAuth().session!.user.id}`, read)
