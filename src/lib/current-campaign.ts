const STORAGE_KEY = "current_campaign"

export function readCurrentCampaignId() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveCurrentCampaignId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Remembering the choice is a convenience only.
  }
}
