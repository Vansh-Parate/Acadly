import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { motion, useMotionValue, useTransform } from "framer-motion"
import type { Mentor } from "@/components/user-card"

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "CS", "Economics", "English", "History"]

export default function RequestModal({
  open,
  onOpenChange,
  mentor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mentor?: Mentor
}) {
  const [message, setMessage] = React.useState("")
  const [subject, setSubject] = React.useState<string>(mentor?.subjects?.[0] ?? "Math")
  const urgencyMV = useMotionValue(0.4)
  const urgency = useTransform(urgencyMV, [0, 1], [0, 1])

  React.useEffect(() => {
    const base = Math.min(1, message.length / 160)
    const extra = /urgent|asap|now/i.test(message) ? 0.3 : 0
    const bang = (message.match(/!/g) || []).length * 0.05
    urgencyMV.set(Math.min(1, base + extra + bang))
  }, [message, urgencyMV])

  const submit = () => {
    // TODO: hook backend
    onOpenChange(false)
    setMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a session</DialogTitle>
          <DialogDescription>
            {mentor ? `Connect with ${mentor.name}` : "Send a quick request to a mentor"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              placeholder="Briefly describe your question and what you need help with…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="border rounded-md bg-transparent p-2 text-sm"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI urgency estimate</span>
              <UrgencyBadge value={Number(urgency.get().toFixed(2))} />
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                style={{ scaleX: urgency }}
                className="h-full origin-left bg-foreground"
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UrgencyBadge({ value = 0.4 }: { value?: number }) {
  const label = value > 0.75 ? "High" : value > 0.45 ? "Medium" : "Low"
  const color =
    value > 0.75 ? "bg-red-500/15 text-red-600 dark:text-red-400" :
    value > 0.45 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${color}`}>
      {label} ({Math.round(value * 100)}%)
    </span>
  )
}
