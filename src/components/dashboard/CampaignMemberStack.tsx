import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import type { Member } from "@/lib/campaign-members"
import { initialsOf } from "@/lib/profile"

const SHOWN = 4

// A few member avatars overlapping, and how many people there are in all.
// Nothing shows until the members have loaded.
export function CampaignMemberStack({ members }: { members: Member[] | undefined }) {
  if (!members) return <div className="h-6" />

  return (
    <div className="flex items-center gap-2">
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
