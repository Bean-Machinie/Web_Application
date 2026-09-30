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
import { MemberMenu } from "./MemberMenu"
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

export function MembersTable({ members, userId, actionsFor }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {actionsFor && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const name = member.username || "Unnamed"
            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {member.avatarUrl && (
                        <AvatarImage src={member.avatarUrl} alt="" />
                      )}
                      <AvatarFallback className="text-xs">
                        {initialsOf(name) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium">{name}</span>
                    {member.userId === userId && (
                      <span className="text-muted-foreground text-xs">You</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{roleLabel(member)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                {actionsFor && (
                  <TableCell className="text-right">
                    <MemberMenu name={name} actions={actionsFor(member)} />
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
