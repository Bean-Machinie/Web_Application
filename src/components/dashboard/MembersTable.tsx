import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Member } from "@/lib/campaign-members"
import { initialsOf } from "@/lib/profile"
import { formatDate } from "@/lib/time"
import { MemberMenu } from "./MemberMenu"
import { cellClass, headClass, headRowClass } from "./members-table-styles"
import type { MemberAction } from "./MemberMenu"

type Props = {
  members: Member[]
  userId: string
  // Null when this person may not change anyone, which hides the menu column.
  actionsFor: ((member: Member) => MemberAction[]) | null
}

function roleLabel(member: Member) {
  if (member.isCreator) return "Owner"
  return member.role === "gm" ? "GM" : "Player"
}

function roleVariant(member: Member) {
  if (member.isCreator) return "default"
  return member.role === "gm" ? "secondary" : "outline"
}

export function MembersTable({ members, userId, actionsFor }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={headRowClass}>
          <TableHead className={`${headClass} w-[55%]`}>Name</TableHead>
          <TableHead className={headClass}>Role</TableHead>
          <TableHead className={headClass}>Joined</TableHead>
          {actionsFor && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const name = member.username || "Unnamed"
          return (
            <TableRow key={member.userId}>
              <TableCell className={cellClass}>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt="" />
                    )}
                    <AvatarFallback className="text-xs">
                      {initialsOf(name) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{name}</span>
                  {member.userId === userId && (
                    <span className="text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 text-[11px] leading-none">
                      You
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className={cellClass}>
                <Badge variant={roleVariant(member)}>{roleLabel(member)}</Badge>
              </TableCell>
              <TableCell className={`${cellClass} text-muted-foreground`}>
                {formatDate(member.joinedAt)}
              </TableCell>
              {actionsFor && (
                <TableCell className={`${cellClass} text-right`}>
                  <MemberMenu name={name} actions={actionsFor(member)} />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
