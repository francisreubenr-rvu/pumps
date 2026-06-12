'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dumbbell } from 'lucide-react'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('username').eq('id', data.user.id).single()
      if (p?.username) router.replace('/dashboard')
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!username || username.length < 3) return
    setBusy(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    await supabase.from('profiles').update({ username }).eq('id', user.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow-primary)' }}>
            <Dumbbell className="h-8 w-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading-stack)' }}>WELCOME</h1>
          <p className="mt-2 text-sm tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono-stack)', color: 'var(--muted)' }}>
            Choose your gym name
          </p>
        </div>

        <div className="card-sheet p-6">
          <form onSubmit={save} className="flex flex-col gap-5">
            <div>
              <label className="label-sm">USERNAME</label>
              <input
                type="text" required minLength={3} maxLength={30}
                placeholder="your_gym_name"
                value={username} onChange={e => setUsername(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={busy || username.length < 3} className="btn-primary w-full">
              {busy ? 'Saving...' : 'Let\'s Go'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
