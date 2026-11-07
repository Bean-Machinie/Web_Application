import { LayoutGrid, List, Network } from "lucide-react"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { ToolbarToggle } from "./ToolbarToggle"

const VIEWS = [
  { value: "list", label: "List view", content: <List /> },
  { value: "grid", label: "Grid view", content: <LayoutGrid /> },
  { value: "graph", label: "Graph view", content: <Network /> },
] as const

type Props = {
  mode: WorldViewMode
  onChange: (mode: WorldViewMode) => void
  // The views offered; the library has no list.
  modes?: readonly WorldViewMode[]
}

export function WorldViewToggle({ mode, onChange, modes }: Props) {
  const options = VIEWS.filter((view) => !modes || modes.includes(view.value)).map((view) => ({ ...view }))
  return <ToolbarToggle value={mode} onChange={onChange} label="View" options={options} />
}
