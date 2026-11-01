import { useNavigate } from "react-router-dom"
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog"
import { supabase } from "@/lib/supabase"
import { useAccountDialog } from "./useAccountDialog"

type Props = { open: boolean; onClose: () => void }

// Logging out of a guest session cannot be undone, since there is no way back into it.
export function LeaveGuestDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { openFor } = useAccountDialog()

  return (
    <ConfirmDialog
      open={open}
      title="Leave guest session?"
      description="You won't be able to get back to anything you made as a guest."
      confirmLabel="Leave and delete"
      busy={false}
      error={null}
      alternative={{
        label: "Create account",
        onClick: () => {
          onClose()
          openFor()
        },
      }}
      onCancel={onClose}
      onConfirm={async () => {
        await supabase.auth.signOut()
        navigate("/log-in", { replace: true })
      }}
    />
  )
}
