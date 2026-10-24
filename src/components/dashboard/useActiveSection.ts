import { useEffect, useState } from "react"

// The last heading that has reached the top of the page. The page scrolls inside a
// container, so the scroll event is caught on the way down rather than on the window.
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join()

  useEffect(() => {
    const update = () => {
      const passed = ids.filter((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? 1) <= 120)
      setActive(passed[passed.length - 1] ?? ids[0])
    }
    update()
    document.addEventListener("scroll", update, true)
    return () => document.removeEventListener("scroll", update, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}
