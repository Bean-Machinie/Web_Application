// Every page inside a campaign lives under /app/c/:campaignId. Build those
// addresses here instead of writing them out.
export const campaignPath = (campaignId: string, page = "") =>
  page ? `/app/c/${campaignId}/${page}` : `/app/c/${campaignId}`
