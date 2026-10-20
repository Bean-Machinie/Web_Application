import { useNavigate } from "react-router-dom"
import { LibraryDialog } from "@/components/dashboard/LibraryDialog"
import { Campaigns } from "./Campaigns"

// The library is a window over the campaigns home, not a page of its own:
// closing it goes back to the campaigns. Its address still opens it, so the
// sidebar link, the command palette and the back button all work.
export function Library() {
  const navigate = useNavigate()

  return (
    <>
      <Campaigns />
      <LibraryDialog open onClose={() => navigate("/app")} />
    </>
  )
}
