import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE } from '../lib/api'
import AvailabilityScheduler from '../components/AvailabilityScheduler'
import Header from '@/components/header'

export default function MentorProfile() {
  const { token } = useAuth()
  const [bio, setBio] = useState('')
  const [subjects, setSubjects] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number | ''>('')
  const [slots, setSlots] = useState<Array<{ day: string; start: string; end: string }>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/mentor/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        if (d?.profile) {
          setBio(d.profile.bio || '')
          setSubjects(d.profile.subjects || '')
          setHourlyRate(typeof d.profile.hourlyRate === 'number' ? d.profile.hourlyRate : '')
        }
      })
    fetch(`${API_BASE}/mentor/availability`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        if (d?.availability?.slots) setSlots(d.availability.slots)
      })
  }, [token])

  const saveProfile = async () => {
    if (!token) return
    setSaving(true)
    await fetch(`${API_BASE}/mentor/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bio, subjects, hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate) }),
    })
    await fetch(`${API_BASE}/mentor/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slots }),
    })
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">Mentor Profile</h1>
          <p className="text-muted-foreground text-sm">Keep your information up to date so students can find you.</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea className="w-full bg-background border rounded p-2" rows={4} value={bio} onChange={e => setBio(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Subjects (comma separated)</label>
            <input className="w-full bg-background border rounded p-2" value={subjects} onChange={e => setSubjects(e.target.value)} placeholder="Mathematics, Physics" />
          </div>
          <div>
            <label className="block text-sm mb-1">Hourly Rate (₹)</label>
            <input type="number" className="w-full bg-background border rounded p-2" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Availability</h2>
          <AvailabilityScheduler value={slots} onChange={setSlots} />
        </div>

        <div className="flex justify-end">
          <button onClick={saveProfile} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}


