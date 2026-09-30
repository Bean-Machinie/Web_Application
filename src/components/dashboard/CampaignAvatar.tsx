import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initialsOf } from "@/lib/profile"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl?: string | null
  className?: string
}

// A campaign's image in a circle, or its initials in the same circle. Set the
// size with className, for example "size-8".
export function CampaignAvatar({ name, imageUrl, className }: Props) {
  return (
    <Avatar className={cn("size-8", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback className="bg-primary text-primary-foreground text-[0.8em] font-medium">
        {initialsOf(name) || "?"}
      </AvatarFallback>
    </Avatar>
  )
}
