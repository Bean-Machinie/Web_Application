import { Image as KonvaImage, Rect } from "react-konva"
import type { Picture } from "@/lib/map-asset-bake"

type Props = {
  // The picture of the whole canvas, and the sharp one of what is in sight.
  overview: Picture
  canvas: { width: number; height: number }
  sharp: Picture | null
}

// The pictures of the placed art. The overview is under everything, and is
// erased wherever the sharp picture is drawn, so that the two never lie over each
// other: the soft shadows in them would add up and look darker. The nodes are
// named for the export (see sharpAssets), which draws its own.
export function AssetPictures({ overview, canvas, sharp }: Props) {
  return (
    <>
      <KonvaImage name="assets-overview" image={overview.canvas} width={canvas.width} height={canvas.height} listening={false} />
      {sharp && (
        <>
          <Rect
            name="assets-erase"
            x={sharp.x}
            y={sharp.y}
            width={sharp.canvas.width / sharp.scale}
            height={sharp.canvas.height / sharp.scale}
            fill="#000"
            globalCompositeOperation="destination-out"
            listening={false}
          />
          <KonvaImage
            name="assets-view"
            image={sharp.canvas}
            x={sharp.x}
            y={sharp.y}
            width={sharp.canvas.width / sharp.scale}
            height={sharp.canvas.height / sharp.scale}
            listening={false}
          />
        </>
      )}
    </>
  )
}
