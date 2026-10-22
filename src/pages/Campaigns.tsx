import { HomeBody } from "@/components/dashboard/HomeBody"
import { LibraryScopeProvider } from "@/components/dashboard/LibraryScopeProvider"

// Home, where the app always opens.
export function Campaigns() {
  return (
    <LibraryScopeProvider>
      <HomeBody />
    </LibraryScopeProvider>
  )
}
