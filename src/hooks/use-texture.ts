import { useEffect, useState } from "react"

// A texture's image, once it has loaded; null until then, so the map simply
// shows without it for a moment.
export function useTexture(url: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const texture = new Image()
    texture.onload = () => setImage(texture)
    texture.src = url
  }, [url])
  return image
}
