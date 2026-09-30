import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/campaigns"
import {
  fetchInviteSuggestions,
  findInvitee,
  inviteUser,
} from "@/lib/invitations"
import type { InviteSuggestion } from "@/lib/invitations"
import { InvitePersonRow, InvitePersonSkeletonRow } from "./InvitePersonRow"
import type { Person } from "./InvitePersonRow"

const MIN_LOOKUP_LENGTH = 3
const LOOKUP_DELAY_MS = 350

function suggestionCaption(suggestion: InviteSuggestion) {
  return suggestion.reason === "shared_campaign"
    ? `Also in ${suggestion.contextName}`
    : "Invited before"
}

function emptyMessage(text: string) {
  if (text === "") {
    return "No suggestions yet. Search for someone, or share the invite link below."
  }
  if (text.length < MIN_LOOKUP_LENGTH) return "Keep typing to search."
  return "No account found. Enter the full email address or the exact username."
}

// Suggestions come first: people you already share a campaign with, or have
// invited before. Typing narrows them instantly, and once nothing local
// matches, an exact email or username is looked up.
export function InvitePeople({
  campaignId,
  onInvited,
}: {
  campaignId: string
  onInvited: () => void
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Person[] | null>(null)
  const [found, setFound] = useState<Person[]>([])
  // The text `found` belongs to; anything else is out of date.
  const [lookedUp, setLookedUp] = useState<string | null>(null)
  const [invitedIds, setInvitedIds] = useState<string[]>([])
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInviteSuggestions(campaignId)
      .then((list) =>
        setSuggestions(
          list.map((s) => ({
            id: s.id,
            username: s.username,
            avatarUrl: s.avatarUrl,
            caption: suggestionCaption(s),
          }))
        )
      )
      .catch(() => setSuggestions([]))
  }, [campaignId])

  const text = query.trim().toLowerCase()
  const local = (suggestions ?? []).filter((p) =>
    (p.username ?? "").toLowerCase().includes(text)
  )
  const needsLookup =
    suggestions !== null && text.length >= MIN_LOOKUP_LENGTH && local.length === 0

  useEffect(() => {
    if (!needsLookup) return

    let stale = false
    const timer = setTimeout(() => {
      findInvitee(campaignId, text)
        .then((list) => {
          if (stale) return
          setFound(
            list.map((p) => ({
              id: p.id,
              username: p.username,
              avatarUrl: p.avatarUrl,
              isMember: p.isMember,
              invited: p.hasPending,
            }))
          )
        })
        .catch((failure) => !stale && setError(errorMessage(failure)))
        .finally(() => !stale && setLookedUp(text))
    }, LOOKUP_DELAY_MS)

    return () => {
      stale = true
      clearTimeout(timer)
      setLookedUp(null)
      setFound([])
    }
  }, [campaignId, text, needsLookup])

  async function invite(person: Person) {
    setInvitingId(person.id)
    setError(null)
    try {
      await inviteUser(campaignId, person.id)
      setInvitedIds((ids) => [...ids, person.id])
      onInvited()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setInvitingId(null)
    }
  }

  // While the lookup waits out its delay or is in flight there is nothing to
  // show yet, so the skeleton covers that gap too.
  const loading = suggestions === null || (needsLookup && lookedUp !== text)
  const rows = needsLookup ? found : local

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          aria-label="Search by username or email"
          placeholder="Search by username or email"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="pl-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error && <FormAlert tone="error">{error}</FormAlert>}

      <LoadingGate
        loading={loading}
        className="flex h-64 flex-col"
        skeleton={
          <ul className="divide-y rounded-lg border">
            <InvitePersonSkeletonRow />
            <InvitePersonSkeletonRow />
          </ul>
        }
      >
        {() => (
          <>
            {text === "" && rows.length > 0 && (
              <p className="text-muted-foreground shrink-0 px-1 pb-1.5 text-xs font-medium">
                Suggested
              </p>
            )}
            {rows.length > 0 ? (
              <ul className="min-h-0 divide-y overflow-y-auto rounded-lg border">
                {rows.map((person) => (
                  <InvitePersonRow
                    key={person.id}
                    person={{
                      ...person,
                      invited: person.invited || invitedIds.includes(person.id),
                    }}
                    busy={invitingId === person.id}
                    onInvite={() => invite(person)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground flex flex-1 items-center justify-center px-4 text-center text-sm">
                {emptyMessage(text)}
              </p>
            )}
          </>
        )}
      </LoadingGate>
    </div>
  )
}
