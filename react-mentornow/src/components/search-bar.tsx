import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarDays, Filter, Search } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "CS", "Economics", "English", "History"]

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>(["Math", "CS"])
  const [minRating, setMinRating] = useState<number>(4)
  const [availableNow, setAvailableNow] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const toggleSubject = (s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div className="w-full rounded-xl border p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="pl-9"
            aria-label="Search mentors by question or topic"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Find mentors
          </Button>
        </div>
      </div>

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
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSubject(s)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          active ? "bg-foreground text-background" : "hover:bg-muted"
                        }`}
                        aria-pressed={active}
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
                  <Switch checked={availableNow} onCheckedChange={setAvailableNow} aria-label="Available now" />
                </div>
              </div>
            </div>
            <div className="pt-4 md:pt-6 flex flex-wrap gap-2">
              {selected.map((s) => (
                <Badge key={s} variant="outline" className="rounded-full">
                  {s}
                </Badge>
              ))}
              {selected.length === 0 && (
                <span className="text-xs text-muted-foreground">No subjects selected</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
