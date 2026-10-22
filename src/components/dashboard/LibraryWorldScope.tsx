import { Outlet } from "react-router-dom"
import { LibraryScopeProvider } from "./LibraryScopeProvider"

// Gives the pages below it the signed-in person's library. It needs no
// campaign, so it sits outside RequireCampaign.
export function LibraryWorldScope() {
  return (
    <LibraryScopeProvider>
      <Outlet />
    </LibraryScopeProvider>
  )
}
