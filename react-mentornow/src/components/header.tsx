import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BookOpen, Moon, Sun } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useDropdown } from "@/components/ui/dropdown"
import { useTheme } from "@/components/theme-provider"

export default function Header() {
  const { user } = useAuth()
  const role = user?.role

  const navItems = (() => {
    if (!user) return []
    if (role === 'STUDENT') {
      return [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/my-sessions', label: 'My Sessions' },
      ]
    }
    if (role === 'MENTOR') {
      return [
        { to: '/mentor-dashboard', label: 'Dashboard' },
        { to: '/mentor-sessions', label: 'Sessions' },
        { to: '/mentor-profile', label: 'Profile' },
      ]
    }
    if (role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Admin' },
      ]
    }
    return []
  })()

  const navigate = useNavigate()
  const { open, setOpen, ref } = useDropdown()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        {/* Left group: brand + primary nav */}
        <div className="flex items-center gap-8 ml-1 md:ml-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">MentorNow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="text-sm font-medium hover:text-blue-500 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {!user ? (
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          ) : (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-1 ring-border hover:ring-foreground/40 transition-transform"
                aria-label="User menu"
              >
                <span className="text-xs font-semibold">{(user.name || user.email || 'U').slice(0,1).toUpperCase()}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 rounded-md border bg-popover shadow-md p-1 origin-top-right animate-in fade-in-0 zoom-in-95">
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
                    onClick={() => { setOpen(false); localStorage.clear(); window.location.href = '/login' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
