import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseInviteCode } from "@/lib/campaigns"

// In place of Continue for someone with no campaign and no character: paste an invite link to
// join, or build a first character. The same size as the Continue card.
export function HomeGetStarted({ onCreateCharacter }: { onCreateCharacter: () => void }) {
  const navigate = useNavigate()
  const [invite, setInvite] = useState("")

  return (
    <section className="bg-card flex h-[140px] flex-col gap-2 rounded-xl border p-4">
      <h2 className="text-lg font-semibold tracking-tight">Get started</h2>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          navigate(`/invite?code=${encodeURIComponent(parseInviteCode(invite))}`)
        }}
      >
        <Input value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="Paste an invite link" aria-label="Invite link" />
        <Button type="submit" disabled={invite.trim() === ""}>
          Join
        </Button>
      </form>
      <Button variant="secondary" size="sm" className="self-start" onClick={onCreateCharacter}>
        Create your first character
      </Button>
    </section>
  )
}
