import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { motion } from "framer-motion"

export default function LandingCTA() {
  return (
    <section id="get-started" className="py-20 md:py-32">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 rounded-2xl border p-8 md:p-16"
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to get the help you need?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already getting instant, personalized help from expert mentors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/signup">
                Start learning now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/signup">
                Create account
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free to start • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}
