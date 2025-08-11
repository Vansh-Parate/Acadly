import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, Users, Zap } from 'lucide-react'
import { motion } from "framer-motion"

export default function LandingHero() {
  return (
    <section id="home" className="relative overflow-hidden py-20 md:py-32">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="rounded-full px-4 py-1.5">
              <Sparkles className="h-3 w-3 mr-2" />
              AI-powered mentor matching
            </Badge>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Get instant help from
              <span className="block text-muted-foreground">the right mentor</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect with expert mentors in seconds. AI matches you with the perfect tutor based on your question, 
              subject expertise, and availability. Get help when you need it most.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="gap-2" asChild>
              <Link to="/signup">
                Start learning now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Watch demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-8 pt-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>500+ mentors</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Instant matching</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
