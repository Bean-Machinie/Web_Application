import { Dumbbell, Hammer } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// The character builder's workspaces, which the rail switches between. Each has its own left
// panel (named for its handle) and centre; the character and its tabs stay on the right in all of them.
export type Workspace = "build" | "abilities"

export const WORKSPACES: { id: Workspace; label: string; key: string; Icon: LucideIcon; panel: string }[] = [
  { id: "build", label: "Build", key: "B", Icon: Hammer, panel: "build settings" },
  { id: "abilities", label: "Abilities", key: "A", Icon: Dumbbell, panel: "ability scores" },
]
