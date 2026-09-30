import { useLocation } from "react-router-dom"

export function useIsActiveRoute() {
  const { pathname } = useLocation()

  return (to: string, exact = false) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
}
