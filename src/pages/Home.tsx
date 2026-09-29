import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main>
      <h1>Web Application</h1>
      <ul>
        <li>
          <Link to="/app">Dashboard</Link>
        </li>
        <li>
          <Link to="/login">Log in</Link>
        </li>
        <li>
          <Link to="/signup">Sign up</Link>
        </li>
      </ul>
    </main>
  )
}
