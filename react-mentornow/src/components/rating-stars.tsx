import * as React from "react"
import { Star } from 'lucide-react'
import { motion } from "framer-motion"

export default function RatingStars({ initial = 4.5, onChange }: { initial?: number; onChange?: (v: number) => void }) {
  const [value, setValue] = React.useState(initial)
  const hoverRef = React.useRef<number | null>(null)

  const setV = (v: number) => {
    setValue(v)
    onChange?.(v)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hoverRef.current ?? value) >= i - 0.01
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => (hoverRef.current = i)}
            onMouseLeave={() => (hoverRef.current = null)}
            onClick={() => setV(i)}
            className="p-0.5"
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          >
            <Star className={`h-4 w-4 ${active ? "fill-foreground text-foreground" : "text-muted-foreground"}`} />
          </motion.button>
        )
      })}
      <span className="ml-1 text-xs text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  )
}
