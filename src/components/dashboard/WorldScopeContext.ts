import { createContext } from "react"
import type { WorldScope } from "@/lib/world-scope"

export const WorldScopeContext = createContext<WorldScope | null>(null)
