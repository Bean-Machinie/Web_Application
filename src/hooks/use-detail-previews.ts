import { useEffect, useState } from "react"
import { detailPreviews } from "@/lib/details/detail-preview"
import type { DetailPreviews } from "@/lib/details/detail-preview"

// The brush pictures for the details list: null until they are drawn.
export function useDetailPreviews() {
  const [previews, setPreviews] = useState<DetailPreviews | null>(null)
  useEffect(() => {
    let current = true
    detailPreviews().then(
      (made) => current && setPreviews(made),
      // The rows just stay plain.
      () => {}
    )
    return () => {
      current = false
    }
  }, [])
  return previews
}
