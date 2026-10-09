import { useCallback, useState } from "react"
import type { MapScene } from "@/lib/map-scene"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import { useArmedAsset } from "./use-armed-asset"
import { useAssetEditing } from "./use-asset-editing"
import { useBrush } from "./use-brush"
import { useSpacePan } from "./use-space-pan"

type Options = {
  assets: MapScene["assets"]
  change: (update: (scene: MapScene) => MapScene) => void
  centre: () => { x: number; y: number }
  pointer: () => { x: number; y: number } | null
  // Everything is off while publishing.
  locked: boolean
}

// The tool in use and everything that goes with it: the land mode, the brush,
// the selection of art, and the art picked up to be stamped. Picking a tool puts
// down stamping, and the selection only means something with the select tool.
export function useBuilderTools({ assets, change, centre, pointer, locked }: Options) {
  const [tool, setTool] = useState<BuilderTool>("land")
  const [mode, setMode] = useState<LandMode>("add")
  const [hideAssets, setHideAssets] = useState(false)
  const brush = useBrush()
  const stamping = useArmedAsset(!locked)
  const { disarm } = stamping

  const editing = useAssetEditing({
    assets,
    change,
    centre,
    pointer,
    // Placed, pasted or selected art is shown with the select tool.
    onPlaced: useCallback(() => {
      setTool("select")
      disarm()
    }, [disarm]),
  })
  const { clear } = editing

  const changeTool = useCallback(
    (next: BuilderTool) => {
      setTool(next)
      disarm()
      if (next !== "select") clear()
    },
    [clear, disarm]
  )
  // Picking art up lets go of the selection, which would otherwise be out of
  // sight and still there for Delete.
  const armAsset = (id: string) => {
    clear()
    stamping.arm(id)
  }

  // The hand is out for as long as its key is held, and the tool is not changed,
  // so the selection is kept.
  const pan = useSpacePan(!locked)

  return {
    tool,
    activeTool: pan.panning ? ("hand" as const) : tool,
    panHold: pan.hold,
    mode,
    setMode,
    brush,
    editing,
    armed: stamping.armed,
    disarm,
    armAsset,
    changeTool,
    // Hiding the art is for painting under it.
    showAssets: !hideAssets || tool !== "brush",
    hideAssets,
    setHideAssets,
  }
}
