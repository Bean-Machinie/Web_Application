import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { Grid2x2Icon } from "@/components/icons/Grid2x2Icon"
import { UserPenIcon } from "@/components/icons/UserPenIcon"

// The character builder's workspaces, which the rail switches between. Each has its own left
// panel (named for its handle) and centre; the character and its tabs stay on the right in all of them.
export type Workspace = "build" | "abilities"

export const WORKSPACES: { id: Workspace; label: string; key: string; Icon: AnimatedIconComponent; panel: string }[] = [
  { id: "build", label: "Build", key: "B", Icon: UserPenIcon, panel: "build settings" },
  { id: "abilities", label: "Abilities", key: "A", Icon: Grid2x2Icon, panel: "ability scores" },
]
