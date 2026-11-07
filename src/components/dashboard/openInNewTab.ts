import { FolderPlus, SquarePlus } from "lucide-react"
import type { MemberAction } from "./MemberMenu"

// The right-click item of anything in the library that opens in the panel; none elsewhere.
export const openInNewTab = (openNew: ((id: string) => void) | null, id: string): MemberAction[] =>
  openNew ? [{ label: "Open in new tab", icon: SquarePlus, onSelect: () => openNew(id) }] : []

// The right-click item that puts a library entry or an SRD creature into a campaign.
export const addToCampaignAction = (onAdd: () => void): MemberAction => ({ label: "Add to campaign", icon: FolderPlus, onSelect: onAdd })
