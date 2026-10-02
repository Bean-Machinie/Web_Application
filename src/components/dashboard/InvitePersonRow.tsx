import { Check, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { initialsOf } from "@/lib/profile"

export type Person = {
  id: string
  username: string | null
  avatarUrl: string | null
  // Why they are suggested, such as "Also in Dragon Heist".
  caption?: string
  isMember?: boolean
  invited?: boolean
}

type Props = {
  person: Person
  busy: boolean
  onInvite: () => void
}

function Action({ person, busy, onInvite }: Props) {
  if (person.isMember) {
    return <span className="text-muted-foreground text-sm">In campaign</span>
  }
  if (person.invited) {
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-500">
        <Check className="size-4" />
        Invited
      </span>
    )
  }
  return (
    <Button size="sm" variant="outline" disabled={busy} onClick={onInvite}>
      {busy && <Loader2 className="size-3.5 animate-spin" />}
      Invite
    </Button>
  )
}

// Row height is shared with the skeleton row below.
export function InvitePersonRow(props: Props) {
  const { person } = props
  const name = person.username || "Unnamed"

  return (
    <li className="flex h-14 items-center gap-3 px-3">
      <Avatar className="size-9">
        {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
        <AvatarFallback className="text-xs">
          {initialsOf(name) || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-5 font-medium">{name}</p>
        {person.caption && (
          <p className="text-muted-foreground truncate text-xs leading-4">
            {person.caption}
          </p>
        )}
      </div>
      <Action {...props} />
    </li>
  )
}

export function InvitePersonSkeletonRow() {
  return (
    <li className="flex h-14 items-center gap-3 px-3" aria-hidden="true">
      <div className="bg-muted size-9 animate-pulse rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-36 animate-pulse rounded-md" />
      </div>
      <div className="bg-muted h-7 w-16 animate-pulse rounded-sm" />
    </li>
  )
}
