import { GraphSliderRow } from "./GraphSliderRow"
import { GraphSwitchRow } from "./GraphSwitchRow"

type Props = {
  on: boolean
  onToggle: (on: boolean) => void
  depth: number
  onDepth: (depth: number) => void
}

// For the selected entry: show only it and what is within a few steps of it.
export function GraphFocusControls({ on, onToggle, depth, onDepth }: Props) {
  return (
    <div className="bg-card/90 grid gap-3 rounded-lg border p-3 shadow-md backdrop-blur-sm">
      <GraphSwitchRow id="graph-focus" label="Focus" checked={on} onChange={onToggle} />
      {on && (
        <GraphSliderRow id="graph-depth" label="Depth" value={depth} min={1} max={3} step={1} onChange={onDepth} />
      )}
    </div>
  )
}
