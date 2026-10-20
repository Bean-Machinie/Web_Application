import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Member } from "@/lib/campaign-members"
import { initialsOf } from "@/lib/profile"

const SHOWN = 4

// A few member avatars overlapping, and how many people there are in all.
// Until the members have loaded a skeleton of the same size holds the place,
// and the real thing fades in over it.
export function CampaignMemberStack({ members }: { members: Member[] | undefined }) {
  if (!members) {
    return (
      <div className="flex h-6 items-center gap-2" aria-hidden>
        <div className="flex -space-x-2">
          {[0, 1, 2].map((slot) => (
            <Skeleton key={slot} className="ring-background size-6 rounded-full ring-2" />
          ))}
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in flex h-6 items-center gap-2 duration-300">
      <AvatarGroup>
        {members.slice(0, SHOWN).map((member) => (
          <Avatar key={member.userId} size="sm">
            {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
            <AvatarFallback className="text-[10px]">
              {initialsOf(member.username ?? "") || "?"}
            </AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <span className="text-muted-foreground text-xs">
        {members.length === 1 ? "1 member" : `${members.length} members`}
      </span>
    </div>
  )
}
