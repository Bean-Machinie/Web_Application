import { useNavigate } from "react-router-dom"
import { EntryNameDialog } from "./EntryNameDialog"
import { useWorldScope } from "./useWorldScope"

type Props = { open: boolean; onClose: () => void }

// Asks for a name, makes the map in the place the World components are looking at (a
// campaign's world, or your library) and opens the map builder on it.
export function NewMapDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const scope = useWorldScope()

  return (
    <EntryNameDialog
      open={open}
      title="New map"
      description="Name the map. You can change it later."
      submitLabel="Create and open"
      onSubmit={async (name) => {
        const map = await scope.createEntry("map", name)
        navigate(`${scope.basePath}/${map.id}/build`)
      }}
      onClose={onClose}
    />
  )
}
