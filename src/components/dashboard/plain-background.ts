import { createContext, useContext, useEffect } from "react"

// Set by the layout, which shows the dithered background unless a page asks for the plain one.
export const PlainBackgroundContext = createContext<(plain: boolean) => void>(() => {})

// Asks for the plain background while the calling page is shown, such as a full-screen canvas.
export function usePlainBackground() {
  const setPlain = useContext(PlainBackgroundContext)
  useEffect(() => {
    setPlain(true)
    return () => setPlain(false)
  }, [setPlain])
}
