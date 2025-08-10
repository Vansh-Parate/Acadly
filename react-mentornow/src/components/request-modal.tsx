import { useEffect, useState } from 'react'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Mentor } from '@/components/user-card'
import { Input } from '@/components/ui/input'
// using native select here for reliability and a minimal look
import { Textarea } from '../components/ui/textarea'
import { Button } from '@/components/ui/button'
import { API_BASE } from '@/lib/api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  mentor: (Mentor & { profile?: { subjects?: string | null } }) | null
  token: string | null
}

export default function RequestModal({ open, onOpenChange, mentor, token }: Props) {
  const DC = DialogContent as unknown as React.FC<React.PropsWithChildren<{ className?: string }>>
  const [subjects, setSubjects] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!mentor) return
    // Prefer subjects coming from the mentor card (array), fallback to profile string
    const fromCard = Array.isArray(mentor.subjects) ? mentor.subjects : []
    const fromProfile = (mentor.profile?.subjects || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const opts = Array.from(new Set([...fromCard, ...fromProfile]))
    setSubjects(opts)
    setSubject(opts[0] || '')
  }, [mentor])

  const submit = async () => {
    if (!open || !mentor || !token || !subject) return
    setSubmitting(true)
    try {
      let payloadMessage = message
      if (image) {
        const b64 = await toBase64(image)
        payloadMessage = `${message}\n[image:${b64.substring(0,48)}...]`
      }
      const res = await fetch(`${API_BASE}/sessions/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentorId: mentor.id, subject, message: payloadMessage })
      })
      if (!res.ok) throw new Error('request-failed')
      
      toast.success(`Request sent to ${mentor.name}! They'll respond soon.`)
      onOpenChange(false)
    } catch (e) {
      console.error(e)
      toast.error('Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DC>
        <DialogHeader>
          <DialogTitle>Request mentoring with {mentor?.name || 'mentor'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm text-muted-foreground">Subject</label>
            <select
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-input"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Question (optional)</label>
            <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Describe your question..." />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Attach image (optional)</label>
            <Input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files?.[0] || null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button disabled={submitting || !subject || !mentor || !token} onClick={submit}>Send request</Button>
        </DialogFooter>
      </DC>
    </Dialog>
  )
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

