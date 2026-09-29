import { useAuth } from '@/auth/useAuth'

export function Overview() {
  const { session } = useAuth()

  return (
    <div>
      <h1>Overview</h1>
      <p>Signed in as {session?.user.email}</p>
    </div>
  )
}
