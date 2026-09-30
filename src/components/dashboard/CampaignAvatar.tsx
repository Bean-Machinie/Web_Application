import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CampaignEmblem } from "./CampaignEmblem"

type Props = {
  name: string
  imageUrl?: string | null
  className?: string
}

// A campaign's image in a circle, or its emblem in the same circle. Set the
// size with className, for example "size-8".
export function CampaignAvatar({ name, imageUrl, className }: Props) {
  return (
    <Avatar className={cn("size-8", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback className="bg-transparent">
        <CampaignEmblem name={name} />
      </AvatarFallback>
    </Avatar>
  )
}
