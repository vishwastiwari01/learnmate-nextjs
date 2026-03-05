'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, loading, initialized, initialize } = useAuthStore()

  useEffect(() => { if (!initialized) initialize() }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !loading && !session) {
      router.push('/auth')
    }
  }, [initialized, loading, session, router])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl animate-bounce">⚡</div>
          <div className="text-white/30 text-sm font-semibold">Loading LearnMate...</div>
        </div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
