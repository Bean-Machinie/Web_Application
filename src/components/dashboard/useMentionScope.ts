import { useContext } from "react"
import { WorldScopeContext } from "./WorldScopeContext"

// Where mentions point: the entries of the world scope around the editor.
// Null outside one, and there @ does nothing.
export const useMentionScope = () => useContext(WorldScopeContext)
