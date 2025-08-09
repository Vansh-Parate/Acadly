import { Link, useLocation } from 'react-router-dom'

export default function MentorNav() {
  const { pathname } = useLocation()
  const items = [
    { label: 'Overview', to: '/dashboard/mentor' },
    { label: 'Profile', to: '/mentor/profile' },
    { label: 'Sessions', to: '/mentor/sessions' },
  ]

  return (
    <nav className="mt-2 mb-6 border-b">
      <ul className="flex gap-6">
        {items.map((item) => {
          const active = pathname === item.to
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={
                  'inline-block px-1 py-2 text-sm transition-colors border-b-2 ' +
                  (active
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border')
                }
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}


