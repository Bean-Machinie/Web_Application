import { useEffect, useState } from "react"
import { detailPreviews } from "@/lib/details/detail-preview"
import type { DetailPreviews } from "@/lib/details/detail-preview"
import type { SceneBackground } from "@/lib/map-scene"

// The brush pictures for the details list: null until they are drawn.
export function useDetailPreviews(background: SceneBackground) {
  const [previews, setPreviews] = useState<DetailPreviews | null>(null)
  useEffect(() => {
    let current = true
    detailPreviews(background).then(
      (made) => current && setPreviews(made),
      // The rows just stay plain.
      () => {}
    )
    return () => {
      current = false
    }
  }, [background])
  return previews
}
