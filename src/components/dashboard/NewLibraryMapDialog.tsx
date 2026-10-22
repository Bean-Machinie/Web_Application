import { useNavigate } from "react-router-dom"
import { createLibraryEntry } from "@/lib/world-entries"
import { EntryNameDialog } from "./EntryNameDialog"

type Props = { open: boolean; onClose: () => void }

// Asks for a name, makes the map in the library and opens the map builder on it.
export function NewLibraryMapDialog({ open, onClose }: Props) {
  const navigate = useNavigate()

  return (
    <EntryNameDialog
      open={open}
      title="New map"
      description="Name the map. You can change it later."
      submitLabel="Create and open"
      onSubmit={async (name) => {
        const map = await createLibraryEntry("map", name)
        navigate(`/app/library/${map.id}/build`)
      }}
      onClose={onClose}
    />
  )
}
