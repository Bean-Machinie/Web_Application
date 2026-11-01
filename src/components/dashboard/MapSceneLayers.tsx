import type { ComponentProps } from "react"
import { Group, Image as KonvaImage, Layer, Rect } from "react-konva"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { MapScene } from "@/lib/map-scene"
import type { Terrain } from "@/lib/terrain"
import { MapAssetsLayer } from "./MapAssetsLayer"
import { MapBiomeLayer } from "./MapBiomeLayer"
import { MapDetailLayer } from "./MapDetailLayer"
import { MapLandLayer } from "./MapLandLayer"
import { MapRiverLayer } from "./MapRiverLayer"
import { MapWaterLayer } from "./MapWaterLayer"

type AssetProps = Pick<
  ComponentProps<typeof MapAssetsLayer>,
  "visible" | "altHeld" | "selected" | "fading" | "editable" | "onSelect" | "onChange"
>

type Props = {
  scene: MapScene
  terrain: Terrain
  land: ComponentProps<typeof MapLandLayer>["land"]
  surface: ComponentProps<typeof MapBiomeLayer>["surface"]
  detailSurface: ComponentProps<typeof MapDetailLayer>["surface"]
  view: BuilderView
  size: { width: number; height: number }
  assets: AssetProps
}

// What the map is made of, as the builder draws it: the sheet, the sea, the water, the land, the
// biomes and the details (the "surfaces" layer, which changes seldom), and the art over them.
// The builder puts its own tools over this, and a preview draws it alone.
export function MapSceneLayers({ scene, terrain, land, surface, detailSurface, view, size, assets }: Props) {
  const { canvas } = scene

  return (
    <>
      <Layer name="surfaces" listening={false}>
        {/* The canvas lies on the surface like a sheet. */}
        <Group name="chrome">
          <Rect
            width={canvas.width}
            height={canvas.height}
            fill="#000"
            shadowColor="#000"
            shadowBlur={90}
            shadowOffsetY={24}
            shadowOpacity={0.3}
          />
        </Group>
        <KonvaImage name="sea" image={terrain.sea} width={canvas.width} height={canvas.height} />
        <MapWaterLayer land={land} style={scene.style} canvas={canvas} view={view} size={size} />
        <MapLandLayer land={land} background={canvas.background} texture={terrain.land} textureScale={terrain.scale} />
        <MapBiomeLayer
          land={land}
          canvas={canvas}
          style={scene.style}
          paint={scene.paint}
          surface={surface}
          after={<MapRiverLayer canvas={canvas} surface={detailSurface} />}
        >
          <MapDetailLayer land={land} canvas={canvas} details={scene.details} surface={detailSurface} />
        </MapBiomeLayer>
      </Layer>
      <MapAssetsLayer
        canvas={canvas}
        land={land}
        paint={scene.paint}
        surface={surface}
        terrain={terrain}
        backdrop={terrain.sea}
        view={view}
        size={size}
        assets={scene.assets}
        {...assets}
      />
    </>
  )
}
