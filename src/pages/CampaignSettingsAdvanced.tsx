import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { DangerZone } from "@/components/dashboard/DangerZone"
import { SettingsSection } from "@/components/dashboard/SettingsSection"
import { TransferOwnership } from "@/components/dashboard/TransferOwnership"
import { useCampaign } from "@/components/dashboard/useCampaign"
import {
  canDeleteCampaign,
  canTransferCampaign,
} from "@/lib/campaign-permissions"

export function CampaignSettingsAdvanced() {
  const userId = useAuth().session!.user.id
  const { current, can } = useCampaign()

  if (!current) return null
  if (!can("manage")) return <Navigate to="../general" replace />

  const canTransfer = canTransferCampaign(current, userId)
  const canDelete = canDeleteCampaign(current, userId)

  if (!canTransfer && !canDelete) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        Only the person who created this campaign can transfer or delete it.
      </p>
    )
  }

  return (
    <>
      {canTransfer && (
        <SettingsSection
          title="Transfer ownership"
          description="Hand this campaign to another member. They become a GM, and you stay one."
        >
          <TransferOwnership key={current.id} campaign={current} />
        </SettingsSection>
      )}
      {canDelete && <DangerZone key={current.id} campaign={current} />}
    </>
  )
}
