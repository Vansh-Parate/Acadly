import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import RatingStars from "@/components/rating-stars"
import { motion } from "framer-motion"

export type Mentor = {
  id: number
  name: string
  avatarUrl?: string
  subjects: string[]
  rating: number
  hourlyRate?: number
  successRate?: number
  aiScore?: number
  availableNow?: boolean
  bio?: string
}

export default function UserCard({
  mentor,
  onRequest,
}: {
  mentor: Mentor
  onRequest?: (m: Mentor) => void
}) {
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 24 }}
      className="h-full"
    >
      <Card className="p-4 h-full flex flex-col hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage
              src={mentor.avatarUrl || "/placeholder.svg?height=80&width=80&query=mentor%20avatar"}
              alt={`${mentor.name} avatar`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight truncate">{mentor.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {mentor.bio || "Helpful mentor with practical tips"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium">
                  {mentor.hourlyRate ? `$${mentor.hourlyRate}/hr` : "Free"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((mentor.successRate ?? 0.82) * 100)}% success
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {mentor.subjects.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                {s}
              </Badge>
            ))}
            {mentor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                +{mentor.subjects.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <RatingStars initial={mentor.rating} />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">AI match</span>
              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((mentor.aiScore ?? 0.76) * 100)}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                  className="h-full bg-foreground"
                />
              </div>
              <span className="font-medium">
                {Math.round((mentor.aiScore ?? 0.76) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto border-t">
          <div className="text-xs">
            {mentor.availableNow ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Available now
              </span>
            ) : (
              <span className="text-muted-foreground">Next slot: 2h</span>
            )}
          </div>
          <Button size="sm" onClick={() => onRequest?.(mentor)} className="px-4">
            Request
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
