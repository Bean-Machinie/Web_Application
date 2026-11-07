import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseInviteCode } from "@/lib/campaigns"

// "I have an invite": a button that grows, with a layout animation, into the field to paste the link
// into and Join. Escape folds it back.
export function InviteReveal() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [invite, setInvite] = useState("")

  if (!open) {
    return (
      <motion.div layoutId="invite-reveal" layout>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          I have an invite
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.form
      layoutId="invite-reveal"
      layout
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (invite.trim()) navigate(`/invite?code=${encodeURIComponent(parseInviteCode(invite))}`)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
    >
      <Input autoFocus value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Paste your invite link" aria-label="Invite link" className="bg-background/80 h-8 w-64" />
      <Button type="submit" size="sm" disabled={invite.trim() === ""}>
        Join
      </Button>
    </motion.form>
  )
}
