import { useMemo, useState } from "react"
import UserCard, { type Mentor } from "@/components/user-card"
import RequestModal from "@/components/request-modal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import EmptyState from "@/components/empty-state"
import { Users, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MatchingResultsProps {
  mentors?: Mentor[]
  isSearchResults?: boolean
  onClearSearch?: () => void
}

export default function MatchingResults({ 
  mentors = [] as Mentor[], 
  isSearchResults = false,
  onClearSearch 
}: MatchingResultsProps) {
  const { token } = useAuth()
  const [sortBy, setSortBy] = useState<"best" | "rating" | "price">("best")
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null)

  const sorted = useMemo(() => {
    const copy = [...mentors]
    if (sortBy === "rating") copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    else if (sortBy === "price") copy.sort((a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0))
    else copy.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
    return copy
  }, [mentors, sortBy])

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {isSearchResults ? "Search results" : "Recommended mentors"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length} mentor{sorted.length !== 1 ? 's' : ''} {isSearchResults ? 'found' : 'available'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSearchResults && onClearSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSearch}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear search
            </Button>
          )}
          <Tabs value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="best" className="text-xs sm:text-sm">Best match</TabsTrigger>
              <TabsTrigger value="rating" className="text-xs sm:text-sm">Rating</TabsTrigger>
              <TabsTrigger value="price" className="text-xs sm:text-sm">Price</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Users}
          title={isSearchResults ? "No mentors found" : "No mentors available"}
          description={isSearchResults 
            ? "Try adjusting your search filters or check back later for more mentors."
            : "Check back later for available mentors."
          }
          action={isSearchResults && onClearSearch ? { 
            label: "Clear filters", 
            onClick: onClearSearch 
          } : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((mentor) => (
              <motion.div 
                key={mentor.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <UserCard mentor={mentor} onRequest={setActiveMentor} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <RequestModal 
        open={!!activeMentor} 
        onOpenChange={(v) => !v && setActiveMentor(null)} 
        mentor={activeMentor ?? undefined} 
        token={token}
      />
    </section>
  )
}
