import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  DollarSign, 
  Clock, 
  Users, 
  BookOpen,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Mentor {
  id: number
  name: string
  avatarUrl?: string
  subjects: string[]
  rating: number
  hourlyRate: number
  successRate: number
  aiScore: number
  availableNow: boolean
  bio: string
  location?: string
  experience: number
  languages: string[]
  availability: string[]
}

interface SearchFilters {
  query: string
  subjects: string[]
  minRating: number
  maxPrice: number
  location: string
  availability: string[]
  languages: string[]
  experience: number
  sortBy: 'rating' | 'price' | 'experience' | 'aiScore'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  mentors: Mentor[]
  onFiltersChange: (filters: SearchFilters) => void
  onMentorSelect: (mentor: Mentor) => void
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'History', 'Geography', 'Economics', 'Psychology',
  'Art', 'Music', 'Literature', 'Philosophy', 'Engineering'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Korean', 'Arabic', 'Russian', 'Portuguese', 'Italian', 'Dutch'
]

const AVAILABILITY = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function AdvancedSearch({ 
  mentors, 
  onFiltersChange, 
  onMentorSelect 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    subjects: [],
    minRating: 0,
    maxPrice: 200,
    location: '',
    availability: [],
    languages: [],
    experience: 0,
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Generate search suggestions
  useEffect(() => {
    if (filters.query.length < 2) {
      setSuggestions([])
      return
    }

    const query = filters.query.toLowerCase()
    const mentorNames = mentors.map(m => m.name.toLowerCase())
    const subjectMatches = SUBJECTS.filter(s => s.toLowerCase().includes(query))
    const nameMatches = mentorNames.filter(n => n.includes(query))
    
    const allSuggestions = [...new Set([...subjectMatches, ...nameMatches])]
    setSuggestions(allSuggestions.slice(0, 5))
  }, [filters.query, mentors])

  // Apply filters and notify parent
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      // Text search
      if (filters.query && !mentor.name.toLowerCase().includes(filters.query.toLowerCase()) &&
          !mentor.subjects.some(s => s.toLowerCase().includes(filters.query.toLowerCase())) &&
          !mentor.bio.toLowerCase().includes(filters.query.toLowerCase())) {
        return false
      }

      // Subject filter
      if (filters.subjects.length > 0 && 
          !filters.subjects.some(subject => mentor.subjects.includes(subject))) {
        return false
      }

      // Rating filter
      if (mentor.rating < filters.minRating) {
        return false
      }

      // Price filter
      if (mentor.hourlyRate > filters.maxPrice) {
        return false
      }

      // Location filter
      if (filters.location && mentor.location && 
          !mentor.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Availability filter
      if (filters.availability.length > 0 && 
          !filters.availability.some(day => mentor.availability.includes(day))) {
        return false
      }

      // Language filter
      if (filters.languages.length > 0 && 
          !filters.languages.some(lang => mentor.languages.includes(lang))) {
        return false
      }

      // Experience filter
      if (mentor.experience < filters.experience) {
        return false
      }

      return true
    }).sort((a, b) => {
      const aValue = a[filters.sortBy]
      const bValue = b[filters.sortBy]
      
      if (filters.sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }, [mentors, filters])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      subjects: [],
      minRating: 0,
      maxPrice: 200,
      location: '',
      availability: [],
      languages: [],
      experience: 0,
      sortBy: 'rating',
      sortOrder: 'desc'
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v !== '' && v !== 0
  ).length - 2 // Subtract sortBy and sortOrder

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors, subjects, or topics..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10 pr-4"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleFilterChange('query', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 mt-1"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm"
                  onClick={() => handleFilterChange('query', suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center space-x-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="aiScore">AI Score</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Subjects */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subjects</label>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {SUBJECTS.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject}
                            checked={filters.subjects.includes(subject)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('subjects', [...filters.subjects, subject])
                              } else {
                                handleFilterChange('subjects', filters.subjects.filter(s => s !== subject))
                              }
                            }}
                          />
                          <label htmlFor={subject} className="text-sm">
                            {subject}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Rating & Price */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rating</label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[filters.minRating]}
                        onValueChange={([value]) => handleFilterChange('minRating', value)}
                        max={5}
                        min={0}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm w-8">{filters.minRating}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Price (per hour)</label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[filters.maxPrice]}
                        onValueChange={([value]) => handleFilterChange('maxPrice', value)}
                        max={200}
                        min={0}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-sm w-12">${filters.maxPrice}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Experience (years)</label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[filters.experience]}
                        onValueChange={([value]) => handleFilterChange('experience', value)}
                        max={20}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-8">{filters.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Languages & Availability */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Languages</label>
                    <ScrollArea className="h-20">
                      <div className="flex flex-wrap gap-1">
                        {LANGUAGES.map((language) => (
                          <Badge
                            key={language}
                            variant={filters.languages.includes(language) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (filters.languages.includes(language)) {
                                handleFilterChange('languages', filters.languages.filter(l => l !== language))
                              } else {
                                handleFilterChange('languages', [...filters.languages, language])
                              }
                            }}
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="flex flex-wrap gap-1">
                      {AVAILABILITY.map((day) => (
                        <Badge
                          key={day}
                          variant={filters.availability.includes(day) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (filters.availability.includes(day)) {
                              handleFilterChange('availability', filters.availability.filter(d => d !== day))
                            } else {
                              handleFilterChange('availability', [...filters.availability, day])
                            }
                          }}
                        >
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
      </div>
    </div>
  )
}
