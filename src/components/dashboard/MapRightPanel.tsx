import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { PlacedAsset } from "@/lib/map-scene"
import { MapAssetPanel } from "./MapAssetPanel"
import { MapProperties } from "./MapProperties"

type Props = {
  assets: PlacedAsset[]
  editing: AssetEditing
  viewScale: number
  disabled: boolean
}

// The panel on the right: the properties of what is selected, above the library.
export function MapRightPanel({ assets, editing, viewScale, disabled }: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l">
      <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
        <MapProperties assets={assets} editing={editing} />
      </div>
      <MapAssetPanel
        onPlace={(id) => void editing.place(id)}
        viewScale={viewScale}
        disabled={disabled}
      />
    </aside>
  )
}
