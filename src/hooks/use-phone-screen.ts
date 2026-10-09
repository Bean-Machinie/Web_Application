import { useEffect, useState } from "react"

// A phone, held either way: narrow, or a touch screen that is not tall (a phone on
// its side is wider than a tablet's narrowest, but never as tall).
const query = "(max-width: 767px), (pointer: coarse) and (max-height: 500px)"

// Whether the screen is a phone's, for what is a sheet there and floats elsewhere.
export function usePhoneScreen() {
  const [phone, setPhone] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setPhone(event.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return phone
}
