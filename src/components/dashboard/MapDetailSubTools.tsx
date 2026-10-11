import { Eraser } from "lucide-react"
import type { Brush } from "@/hooks/use-brush"
import { useDetailPreviews } from "@/hooks/use-detail-previews"
import { DETAILS } from "@/lib/details/details"
import type { Detail } from "@/lib/details/details"
import { MapSubToolButton } from "./MapSubToolButton"

const name = (detail: Detail) => detail[0].toUpperCase() + detail.slice(1)

export function MapDetailSubTools({ brush }: { brush: Brush }) {
  const previews = useDetailPreviews()

  return (
    <>
      {DETAILS.map((detail) => (
        <MapSubToolButton
          key={detail}
          tall
          label={name(detail)}
          hint={`Paint a ${detail} over the biomes`}
          active={brush.detail === detail}
          onClick={() => brush.onDetail(detail)}
        >
          {/* Its place is kept until the picture is there. */}
          <span className="h-[30px] w-[120px] shrink-0">
            {previews && <img src={previews[detail]} alt="" draggable={false} className="size-full object-contain object-left" />}
          </span>
        </MapSubToolButton>
      ))}
      <MapSubToolButton
        label="Eraser"
        hint="Rub out paths, roads and water; the biomes stay"
        active={brush.detail === "erase"}
        onClick={() => brush.onDetail("erase")}
      >
        <Eraser />
      </MapSubToolButton>
    </>
  )
}
