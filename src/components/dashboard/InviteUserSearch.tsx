import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/campaigns"
import { findInvitee, inviteUser } from "@/lib/invitations"
import type { Invitee } from "@/lib/invitations"
import { initialsOf } from "@/lib/profile"

type Props = {
  campaignId: string
  onInvited: () => void
}

function ResultAction({
  person,
  busy,
  onInvite,
}: {
  person: Invitee
  busy: boolean
  onInvite: () => void
}) {
  if (person.isMember) return <Badge variant="secondary">In this campaign</Badge>
  if (person.hasPending) return <Badge variant="secondary">Invited</Badge>

  return (
    <Button size="sm" disabled={busy} onClick={onInvite}>
      {busy && <Loader2 className="size-4 animate-spin" />}
      Invite
    </Button>
  )
}

// Finds one person by their exact email or username. There is no browsing.
export function InviteUserSearch({ campaignId, onInvited }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Invitee[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function search(event: React.FormEvent) {
    event.preventDefault()
    setSearching(true)
    setError(null)
    try {
      setResults(await findInvitee(campaignId, query))
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setSearching(false)
    }
  }

  async function invite(person: Invitee) {
    setInvitingId(person.id)
    setError(null)
    try {
      await inviteUser(campaignId, person.id)
      setResults((list) =>
        list!.map((p) => (p.id === person.id ? { ...p, hasPending: true } : p))
      )
      onInvited()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setInvitingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={search} className="flex gap-2">
        <Input
          aria-label="Email or username"
          placeholder="Email or username"
          autoCapitalize="none"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={searching || query.trim() === ""}
        >
          {searching && <Loader2 className="size-4 animate-spin" />}
          Search
        </Button>
      </form>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {results?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No account found. Enter the full email address or the exact username.
        </p>
      )}
      {results && results.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {results.map((person) => {
            const name = person.username || "Unnamed"
            return (
              <li key={person.id} className="flex items-center gap-3 px-3 py-3">
                <Avatar className="size-9">
                  {person.avatarUrl && (
                    <AvatarImage src={person.avatarUrl} alt="" />
                  )}
                  <AvatarFallback className="text-xs">
                    {initialsOf(name) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                </div>
                <ResultAction
                  person={person}
                  busy={invitingId === person.id}
                  onInvite={() => invite(person)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
