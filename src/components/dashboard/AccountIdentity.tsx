import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAccount } from "@/hooks/use-account"

// The person's avatar, name and email, as the head of the account menu and as the card
// that opens it in the map builder.
export function AccountIdentity() {
  const { name, detail, initials, avatarUrl, isGuest } = useAccount()
  return (
    <>
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={avatarUrl} alt="" />
        <AvatarFallback className="text-xs">{isGuest ? <User className="size-4" /> : initials}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="text-muted-foreground truncate text-xs">{detail}</span>
      </div>
    </>
  )
}
