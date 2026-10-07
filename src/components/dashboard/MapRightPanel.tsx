import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { PlacedAsset } from "@/lib/map-scene"
import { MapAssetPanel } from "./MapAssetPanel"
import { MapProperties } from "./MapProperties"
import { MapSettingsSection } from "./MapSettingsSection"

type Props = {
  assets: PlacedAsset[]
  editing: AssetEditing
  // The map's settings, in a section of their own.
  settings: React.ReactNode
  viewScale: number
  disabled: boolean
}

// The panel on the right, as stacked sections: the properties of what is
// selected, the map's settings (shut until opened), and the library. The panel is
// the only thing that scrolls.
export function MapRightPanel({ assets, editing, settings, viewScale, disabled }: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
      <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
        <MapProperties assets={assets} editing={editing} />
        <MapSettingsSection>{settings}</MapSettingsSection>
      </div>
      <MapAssetPanel
        onPlace={(id) => void editing.place(id)}
        viewScale={viewScale}
        disabled={disabled}
      />
    </aside>
  )
}
