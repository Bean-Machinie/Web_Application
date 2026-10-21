import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BottomNotice } from "./BottomNotice"

export function SavedToLibraryNotice({ name, note }: { name: string; note?: string | null }) {
  return (
    <BottomNotice
      text={`Saved ${name} to your library.${note ? ` ${note}` : ""}`}
      action={
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/app/library">View in library</Link>
        </Button>
      }
    />
  )
}
