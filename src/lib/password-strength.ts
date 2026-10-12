export const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"] as const

// 0 for nothing or too short, then one point each for length, mixed case, a digit and a symbol.
export function passwordStrength(password: string, minLength: number) {
  if (password.length < minLength) return 0

  const checks = [
    password.length >= 10,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  return Math.max(1, checks.filter(Boolean).length)
}
