import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarDays, Filter, Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { mentorsAPI } from "@/lib/api"
import { toast } from "sonner"

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "CS", "Economics", "English", "History"]

interface SearchFilters {
  query: string
  subjects: string[]
  minRating: number
  availableNow: boolean
}

interface SearchBarProps {
  onSearchResults: (mentors: any[]) => void
  onSearching: (searching: boolean) => void
}

export default function SearchBar({ onSearchResults, onSearching }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(4)
  const [availableNow, setAvailableNow] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const toggleSubject = (s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const performSearch = async () => {
    setIsSearching(true)
    onSearching(true)
    
    try {
      // Build search parameters
      const searchParams = new URLSearchParams()
      
      // Add query if provided
      if (query.trim()) {
        searchParams.append('query', query.trim())
      }
      
      // Add subjects if selected
      if (selected.length > 0) {
        searchParams.append('subjects', selected.join(','))
      }
      
      // Add rating filter
      if (minRating > 1) {
        searchParams.append('minRating', minRating.toString())
      }
      
      // Add availability filter
      if (availableNow) {
        searchParams.append('availableNow', 'true')
      }
      
      // Use the correct backend URL
      const apiUrl = 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/mentors?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - expected JSON')
      }
      
      const data = await response.json()
      onSearchResults(data.mentors || [])
      
      if (data.mentors?.length === 0) {
        toast.info("No mentors found matching your criteria. Try adjusting your filters.")
      }
      
    } catch (error) {
      console.error('Search error:', error)
      toast.error("Search failed. Please try again.")
      onSearchResults([])
    } finally {
      setIsSearching(false)
      onSearching(false)
    }
  }

  // Local filtering fallback when search endpoint is not available
  const filterMentorsLocally = (mentors: any[]) => {
    return mentors.filter(mentor => {
      // Filter by query
      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        const matchesName = mentor.name?.toLowerCase().includes(searchTerm)
        const matchesSubjects = mentor.profile?.subjects?.some((subject: string) => 
          subject.toLowerCase().includes(searchTerm)
        )
        if (!matchesName && !matchesSubjects) return false
      }
      
      // Filter by subjects
      if (selected.length > 0) {
        const mentorSubjects = mentor.profile?.subjects || []
        const hasMatchingSubject = selected.some(subject => 
          mentorSubjects.includes(subject)
        )
        if (!hasMatchingSubject) return false
      }
      
      // Filter by rating
      if (minRating > 1) {
        const mentorRating = mentor.profile?.rating || 0
        if (mentorRating < minRating) return false
      }
      
      return true
    })
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always perform search when there's any input or filter change
      performSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, selected, minRating, availableNow])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const clearFilters = () => {
    setQuery("")
    setSelected([])
    setMinRating(4)
    setAvailableNow(true)
  }

  return (
    <div className="w-full rounded-xl border p-4 md:p-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="pl-9"
            aria-label="Search mentors by question or topic"
            disabled={isSearching}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="outline" 
            className="gap-2" 
            onClick={() => setShowFilters((s) => !s)}
            disabled={isSearching}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            type="submit" 
            className="gap-2"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarDays className="h-4 w-4" />
            )}
            {isSearching ? "Searching..." : "Find mentors"}
          </Button>
        </div>
      </form>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pt-4 md:pt-6 grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-sm">Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => {
                    const active = selected.includes(s)
                    return (
                      <motion.button
                        key={s}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSubject(s)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-foreground text-background" : "hover:bg-muted"
                        }`}
                        aria-pressed={active}
                        disabled={isSearching}
                      >
                        {s}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Minimum rating</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[minRating]}
                    min={1}
                    max={5}
                    step={0.5}
                    onValueChange={(v) => setMinRating(v[0] ?? 4)}
                    aria-label="Minimum rating"
                    className="w-full"
                    disabled={isSearching}
                  />
                  <Badge variant="secondary">{minRating.toFixed(1)}+</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Availability</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Available now</div>
                    <div className="text-xs text-muted-foreground">
                      Show mentors who can start right away
                    </div>
                  </div>
                  <Switch 
                    checked={availableNow} 
                    onCheckedChange={setAvailableNow} 
                    aria-label="Available now"
                    disabled={isSearching}
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 md:pt-6 flex flex-wrap gap-2 items-center">
              {selected.map((s) => (
                <Badge key={s} variant="outline" className="rounded-full">
                  {s}
                </Badge>
              ))}
              {selected.length === 0 && (
                <span className="text-xs text-muted-foreground">No subjects selected</span>
              )}
              {(query || selected.length > 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-xs"
                  disabled={isSearching}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
