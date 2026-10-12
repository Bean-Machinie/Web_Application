import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAccount } from "@/hooks/use-account"
import { MenuChevron } from "./MenuChevron"

export function AccountAvatar() {
  const { initials, avatarUrl } = useAccount()
  return (
    <Avatar className="size-8 shrink-0">
      <AvatarImage src={avatarUrl} alt="" />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}

// The name and email, and the chevron that turns while the menu is open.
export function AccountDetails() {
  const { name, email } = useAccount()
  return (
    <>
      <div className="grid flex-1 text-left text-[14.5px] leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="text-muted-foreground truncate text-[12.5px]">{email}</span>
      </div>
      <MenuChevron className="ml-auto" />
    </>
  )
}

// What is in the account button of the dashboard's sidebar: the avatar and the details. It sits
// in a `group/menu-button`, which MenuChevron reads.
export function AccountButtonBody() {
  return (
    <>
      <AccountAvatar />
      <AccountDetails />
    </>
  )
}
