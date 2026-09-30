import { useEffect, useState } from "react"

// A data URL, unlike an object URL, needs no cleanup, so it survives React
// StrictMode's mount/unmount/mount in development.
export function useFileDataUrl(file: File | null) {
  const [loaded, setLoaded] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLoaded({ file, url: reader.result as string })
    reader.readAsDataURL(file)
    return () => {
      reader.onload = null
    }
  }, [file])

  return loaded?.file === file ? loaded.url : null
}
