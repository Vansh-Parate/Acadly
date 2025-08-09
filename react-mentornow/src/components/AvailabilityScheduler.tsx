import { useState } from 'react'

type Slot = { day: string; start: string; end: string }

export default function AvailabilityScheduler({ value, onChange }: { value: Slot[]; onChange: (slots: Slot[]) => void }) {
  const [day, setDay] = useState('Mon')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('12:00')

  const add = () => {
    const next = [...value, { day, start, end }]
    onChange(next)
  }

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select className="bg-background border rounded px-2 py-1" value={day} onChange={e => setDay(e.target.value)}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="time" className="bg-background border rounded px-2 py-1" value={start} onChange={e => setStart(e.target.value)} />
        <input type="time" className="bg-background border rounded px-2 py-1" value={end} onChange={e => setEnd(e.target.value)} />
        <button onClick={add} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Add</button>
      </div>
      <div className="space-y-2">
        {value.length === 0 ? <p className="text-sm text-muted-foreground">No slots yet</p> : null}
        {value.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm border rounded px-2 py-1">
            <span>{s.day} • {s.start} - {s.end}</span>
            <button onClick={() => remove(i)} className="text-red-500">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}


