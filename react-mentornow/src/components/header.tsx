import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">MentorNow</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-sm font-medium hover:text-blue-500 transition-colors">
            Dashboard
          </Link>
          <Link to="/mentors" className="text-sm font-medium hover:text-blue-500 transition-colors">
            Find Mentors
          </Link>
          <Link to="/my-sessions" className="text-sm font-medium hover:text-blue-500 transition-colors">
            My Sessions
          </Link>
          <Link to="/profile" className="text-sm font-medium hover:text-blue-500 transition-colors">
            Profile
          </Link>
        </nav>

        {/* Get Started Button */}
        <div className="flex items-center space-x-2">
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
