import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BottomNotice } from "./BottomNotice"
import type { AddNotice } from "./useAddToCampaign"

// What was added, over the foot of the page, with the way to it.
export function AddToCampaignNotice({ notice }: { notice: AddNotice }) {
  return (
    <BottomNotice
      text={notice.text}
      action={
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to={notice.to}>{notice.linkLabel}</Link>
        </Button>
      }
    />
  )
}
