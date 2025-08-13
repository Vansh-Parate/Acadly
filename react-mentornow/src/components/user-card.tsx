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
  subjects?: string[]
  rating?: number
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
  // Safely handle mentor data with fallbacks
  const mentorName = mentor.name || 'Unknown Mentor'
  const mentorSubjects = Array.isArray(mentor.subjects) ? mentor.subjects : []
  const mentorRating = mentor.rating || 0
  const mentorHourlyRate = mentor.hourlyRate || 0
  const mentorSuccessRate = mentor.successRate || 0.82
  const mentorAiScore = mentor.aiScore || 0.76
  const mentorAvailableNow = mentor.availableNow || false
  const mentorBio = mentor.bio || "Helpful mentor with practical tips"

  const initials = mentorName
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
              alt={`${mentorName} avatar`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight truncate">{mentorName}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {mentorBio}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium">
                  {mentorHourlyRate ? `$${mentorHourlyRate}/hr` : "Free"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(mentorSuccessRate * 100)}% success
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {mentorSubjects.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                {s}
              </Badge>
            ))}
            {mentorSubjects.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                +{mentorSubjects.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <RatingStars initial={mentorRating} />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">AI match</span>
              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(mentorAiScore * 100)}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                  className="h-full bg-foreground"
                />
              </div>
              <span className="font-medium">
                {Math.round(mentorAiScore * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto border-t">
          <div className="text-xs">
            {mentorAvailableNow ? (
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
