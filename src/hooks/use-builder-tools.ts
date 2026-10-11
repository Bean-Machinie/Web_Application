import { useCallback, useState } from "react"
import type { MapScene } from "@/lib/map-scene"
import type { BuilderTool, LandMode, LandTool, PanMode, SelectMode } from "@/lib/map-builder-tools"
import { BIOMES } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import { DETAILS } from "@/lib/details/details"
import { ERASE_TARGETS } from "@/lib/erase"
import { useAltTap } from "./use-alt-tap"
import { useArmedAsset } from "./use-armed-asset"
import { useAssetEditing } from "./use-asset-editing"
import { useBrush } from "./use-brush"
import { getStamps } from "@/lib/stamps/stamp-file"
import type { Stamp } from "@/lib/stamps/stamps"
import { useSpacePan } from "./use-space-pan"
import { useStampPlacement } from "./use-stamp-placement"

// The brush's sub tools in the order the panel lists them, for each tab.
const CHOICES: BrushBiome[] = ["plains", ...BIOMES]

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
  const [landTool, setLandTool] = useState<LandTool>("lasso")
  const [stampIds, setStampIds] = useState<Record<Stamp["group"], string>>({ basic: "circle", islands: "" })
  const placement = useStampPlacement()
  const [selectMode, setSelectMode] = useState<SelectMode>("rectangle")
  const [panMode, setPanMode] = useState<PanMode>("hand")
  const [hideAssets, setHideAssets] = useState(false)
  const brush = useBrush(tool)
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
  const { apply } = placement

  // A shape being placed is applied before the tool or the sub tool changes.
  const changeTool = useCallback(
    (next: BuilderTool) => {
      apply()
      setTool(next)
      disarm()
      if (next !== "select") clear()
    },
    [apply, clear, disarm]
  )
  const changeLandTool = useCallback(
    (next: LandTool) => {
      apply()
      setLandTool(next)
    },
    [apply]
  )
  // Picking art up lets go of the selection, which would otherwise be out of
  // sight and still there for Delete.
  const armAsset = (id: string) => {
    clear()
    stamping.arm(id)
  }

  // A tap of Alt goes on to the next sub tool of the tool in use, round to the first.
  useAltTap(() => {
    if (tool === "select") setSelectMode((now) => (now === "rectangle" ? "lasso" : "rectangle"))
    if (tool === "land") setMode((now) => (now === "add" ? "cut" : "add"))
    if (tool === "hand") setPanMode((now) => (now === "hand" ? "rotate" : "hand"))
    if (tool === "eraser") {
      brush.onErase(ERASE_TARGETS[(ERASE_TARGETS.indexOf(brush.erase) + 1) % ERASE_TARGETS.length])
    } else if (tool === "brush" && brush.layer === "details") {
      brush.onDetail(DETAILS[(DETAILS.indexOf(brush.detail) + 1) % DETAILS.length])
    } else if (tool === "brush") {
      brush.onBiome(CHOICES[(CHOICES.indexOf(brush.biome) + 1) % CHOICES.length])
    }
  }, !locked)

  // The hand is out for as long as its key is held, and the tool is not changed,
  // so the selection is kept.
  const pan = useSpacePan(!locked)

  return {
    tool,
    activeTool: pan.panning ? ("hand" as const) : tool,
    panMode,
    setPanMode,
    // Holding Space always pans, even with the rotate tool picked.
    rotating: tool === "hand" && panMode === "rotate" && !pan.panning,
    panHold: pan.hold,
    mode,
    setMode,
    landTool,
    setLandTool: changeLandTool,
    // The stamp of the tab that is open: each of the two keeps its own.
    stampId: stampIds[landTool === "islands" ? "islands" : "basic"],
    setStampId: (id: string) =>
      setStampIds((now) => {
        const group = getStamps().find((stamp) => stamp.id === id)?.group
        return group ? { ...now, [group]: id } : now
      }),
    placement,
    selectMode,
    setSelectMode,
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
