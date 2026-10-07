// Textures as pictures, loaded once, for drawing that cannot wait for a hook.
const loading = new Map<string, Promise<HTMLImageElement | null>>()

export function loadTexture(url: string) {
  const known = loading.get(url)
  if (known) return known
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
  loading.set(url, promise)
  return promise
}
