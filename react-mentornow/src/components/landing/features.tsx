import { Card } from "@/components/ui/card"
import { Brain, Clock, MessageSquare, Star, Users, Zap } from 'lucide-react'
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our AI analyzes your question and matches you with the most suitable mentor based on expertise and success rate."
  },
  {
    icon: Zap,
    title: "Instant Connection",
    description: "Get connected with available mentors in seconds. No waiting, no scheduling conflicts."
  },
  {
    icon: MessageSquare,
    title: "Smart Chat Assistant",
    description: "Get quick answers from our AI assistant before connecting with a mentor for complex problems."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Find help anytime with mentors across different time zones and flexible schedules."
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "All mentors are verified and rated by students. AI tracks success rates for optimal matching."
  },
  {
    icon: Users,
    title: "Expert Community",
    description: "Connect with university seniors, TAs, and subject matter experts across all disciplines."
  }
]

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to connect you with the right help at the right time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
