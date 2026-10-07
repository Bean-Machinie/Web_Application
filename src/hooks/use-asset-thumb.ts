import { useEffect, useState } from "react"
import { readyThumbnail, thumbnail } from "@/lib/map-asset-thumbs"

// The thumbnail of a piece of art, once "wanted" (the tile has come into view);
// null until it is made. One already made is there at once.
export function useAssetThumb(id: string, wanted: boolean) {
  const [url, setUrl] = useState(() => readyThumbnail(id))

  useEffect(() => {
    if (!wanted || url) return
    let current = true
    void thumbnail(id).then((made) => current && setUrl(made))
    return () => {
      current = false
    }
  }, [id, wanted, url])

  return url
}
