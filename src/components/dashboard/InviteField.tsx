import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseInviteCode } from "@/lib/campaigns"
import { centreOf, useDitherRipple } from "./dither-ripple"

// The field to paste an invite link into, with Join, which goes to the page that accepts it and sets a
// ripple going in the background from the button.
export function InviteField() {
  const navigate = useNavigate()
  const triggerRipple = useDitherRipple()
  const [invite, setInvite] = useState("")

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!invite.trim()) return
        const submitter = (event.nativeEvent as SubmitEvent).submitter
        if (submitter) triggerRipple(...centreOf(submitter))
        navigate(`/invite?code=${encodeURIComponent(parseInviteCode(invite))}`)
      }}
    >
      <Input value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Paste your invite link" aria-label="Invite link" className="bg-background/80 h-9 w-44" />
      <Button type="submit" size="lg" disabled={invite.trim() === ""}>
        Join
      </Button>
    </form>
  )
}
