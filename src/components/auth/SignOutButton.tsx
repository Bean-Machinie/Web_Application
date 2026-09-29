import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function SignOutButton() {
  const navigate = useNavigate()

  async function handleClick() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <button type="button" onClick={handleClick}>
      Log out
    </button>
  )
}
