import { Outlet } from "react-router-dom"
import { CampaignSettingsTabs } from "@/components/dashboard/CampaignSettingsTabs"
import { LeaveCampaignButton } from "@/components/dashboard/LeaveCampaignButton"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"

export function CampaignSettings() {
  const { current } = useCurrentCampaign()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Campaign settings
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Settings for {current.name}.
          </p>
        </div>
        <LeaveCampaignButton key={current.id} campaign={current} />
      </div>
      <CampaignSettingsTabs />
      <Outlet />
    </div>
  )
}
