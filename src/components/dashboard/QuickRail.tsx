import { WORKSPACES } from "@/lib/quick-workspace"
import type { Workspace } from "@/lib/quick-workspace"
import { BuilderRailButton } from "./BuilderRailButton"

type Props = { workspace: Workspace; onWorkspace: (workspace: Workspace) => void }

// The buttons of the rail: one for each workspace, which the rail switches between. They are the
// map builder's tool buttons, with the letter that opens each in its tooltip.
export function QuickRail({ workspace, onWorkspace }: Props) {
  return (
    <>
      {WORKSPACES.map(({ id, label, key, Icon }) => (
        <BuilderRailButton key={id} label={label} active={workspace === id} keys={[key]} onClick={() => onWorkspace(id)}>
          <Icon />
        </BuilderRailButton>
      ))}
    </>
  )
}
