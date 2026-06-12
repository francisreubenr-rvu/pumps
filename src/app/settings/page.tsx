'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
    })
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-lg mx-auto relative">
      <h1 className="text-4xl font-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading-stack)' }}>SETTINGS</h1>
      <p className="label-sm mb-6">YOUR ACCOUNT</p>

      <div className="card-sheet p-5 mb-4 space-y-3">
        <div>
          <span className="label-sm">EMAIL</span>
          <p className="text-sm">{user?.email}</p>
        </div>
        <div>
          <span className="label-sm">USERNAME</span>
          <p className="text-sm">{profile?.username ?? 'Not set'}</p>
        </div>
        <div>
          <span className="label-sm">MEMBER SINCE</span>
          <p className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>

      <button onClick={signOut} className="btn-primary w-full" style={{ background: 'var(--danger)' }}>
        Sign Out
      </button>
    </div>
  )
}
