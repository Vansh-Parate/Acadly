import { Link } from "react-router-dom"
import { Sparkles } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg">MentorNow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered platform connecting students with expert mentors for instant, personalized help.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Product</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                API
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Company</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 MentorNow. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
