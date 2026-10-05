import { useState } from "react"
import { Link2, Unlink2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { loadedAssetImage } from "@/lib/map-assets"
import type { PlacedAsset } from "@/lib/map-scene"
import { PropertyField } from "./PropertyField"

type Props = { assets: PlacedAsset[]; editing: AssetEditing }

// -180 to 180, so the number shown is the shortest way round.
const wrap = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180

// The size and turn of the selected art, as numbers. Sizes are in canvas
// pixels. With the link on, changing one side changes the other to match.
export function MapProperties({ assets, editing }: Props) {
  const [linked, setLinked] = useState(true)
  const chosen = assets.filter((asset) => editing.selected.includes(asset.id))
  const asset = chosen.length === 1 ? chosen[0] : null
  const image = asset && loadedAssetImage(asset.asset)
  const natural = { width: image?.naturalWidth ?? 100, height: image?.naturalHeight ?? 100 }

  function resize(side: "width" | "height", size: number) {
    if (!asset || size <= 0) return
    const base = side === "width" ? natural.width : natural.height
    const factor = size / base
    const own = side === "width" ? "scaleX" : "scaleY"
    const other = side === "width" ? "scaleY" : "scaleX"
    // Keeping the shape means the other side grows by the same factor.
    const grown = (Math.abs(asset[own]) ? factor / Math.abs(asset[own]) : 1) * asset[other]
    editing.commit([
      {
        id: asset.id,
        [own]: Math.sign(asset[own] || 1) * factor,
        [other]: linked ? grown : asset[other],
      },
    ])
  }

  return (
    <section className="flex flex-col gap-3 border-b p-4">
      <h2 className="text-sm font-medium">Properties</h2>
      {chosen.length === 0 && (
        <p className="text-muted-foreground text-[13px]">Select art to adjust it.</p>
      )}
      {chosen.length > 1 && (
        <p className="text-muted-foreground text-[13px]">{chosen.length} selected</p>
      )}
      {asset && (
        <>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
            <PropertyField
              label="Width"
              unit="px"
              value={Math.abs(asset.scaleX) * natural.width}
              onCommit={(size) => resize("width", size)}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={linked ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="mb-0.5"
                  aria-label="Keep proportions"
                  aria-pressed={linked}
                  onClick={() => setLinked((on) => !on)}
                >
                  {linked ? <Link2 /> : <Unlink2 />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keep proportions</TooltipContent>
            </Tooltip>
            <PropertyField
              label="Height"
              unit="px"
              value={Math.abs(asset.scaleY) * natural.height}
              onCommit={(size) => resize("height", size)}
            />
          </div>
          <PropertyField
            label="Rotation"
            unit="°"
            value={wrap(asset.rotation)}
            onCommit={(degrees) => editing.commit([{ id: asset.id, rotation: wrap(degrees) }])}
          />
        </>
      )}
    </section>
  )
}
