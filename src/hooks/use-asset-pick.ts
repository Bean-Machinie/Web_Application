import { useMemo } from "react"
import { makePicker } from "@/lib/map-asset-pick"
import { makePieces } from "@/lib/map-asset-pieces"
import type { PlacedAsset } from "@/lib/map-scene"
import { useAssetInfos } from "./use-asset-infos"

const NONE: ReadonlySet<string> = new Set()

// Finds the art on the map at a point or in an area (see makePicker).
export function useAssetPick(assets: PlacedAsset[], canvas: { width: number; height: number }) {
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))
  // Art that has loaded since last time can be picked now.
  const loaded = new Set(assets.filter((asset) => infoOf(asset.asset)).map((asset) => asset.asset)).size
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => makePicker(makePieces(assets, infoOf, NONE), canvas), [assets, loaded, canvas.width, canvas.height])
}
