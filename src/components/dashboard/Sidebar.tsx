import { Link } from 'react-router-dom'
import { SignOutButton } from '@/components/auth/SignOutButton'

const links = [
  { label: 'Overview', to: '/app' },
  { label: 'Section Two', to: '#' },
  { label: 'Section Three', to: '#' },
  { label: 'Settings', to: '#' },
]

export function Sidebar() {
  return (
    <nav aria-label="Main">
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <SignOutButton />
    </nav>
  )
}
