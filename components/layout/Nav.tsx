'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, xpProgress } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { Home, Swords, BookOpen, Code2, GraduationCap, Map, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { ApiKeyModal } from '@/components/ui/ApiKeyModal'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Home',    icon: Home },
  { href: '/arena',      label: 'Arena',   icon: Swords },
  { href: '/learn',      label: 'Learn',   icon: BookOpen },
  { href: '/coding',     label: 'Code',    icon: Code2 },
  { href: '/courses',    label: 'Courses', icon: GraduationCap },
  { href: '/roadmap',    label: 'Roadmap', icon: Map },
]

export function Nav() {
  const pathname = usePathname()
  const { profile, signOut } = useAuthStore()
  const { apiKey } = useUserStore()
  const [showApiModal, setShowApiModal] = useState(false)
  const progress = profile ? xpProgress(profile.xp) : null

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className="sticky top-0 z-50 hidden md:flex items-center justify-between px-6 py-3 bg-bg-base/90 border-b border-white/[0.07] backdrop-blur-xl">
        <Link href="/dashboard" className="font-sora font-extrabold text-lg tracking-tight grad-orange">
          ⚡ LearnMate
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                pathname === href ? 'bg-brand-purple text-white' : 'text-white/50 hover:text-white hover:bg-bg-elevated'
              )}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {profile && progress && (
            <>
              <div className="flex items-center gap-2 bg-bg-elevated border border-white/10 rounded-full px-3 py-1">
                <span className="text-xs font-bold text-brand-yellow">Lv.{progress.level}</span>
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full transition-all duration-700"
                    style={{ width: `${progress.percent}%` }} />
                </div>
                <span className="text-xs font-bold text-white/60">⚡{profile.xp}</span>
              </div>
              <div className="text-sm font-bold text-brand-orange">🔥{profile.streak}</div>
              <div className="text-lg">{profile.avatar}</div>
            </>
          )}
          <button onClick={() => setShowApiModal(true)}
            className={cn('p-2 rounded-lg transition-all text-sm',
              apiKey ? 'text-brand-green hover:bg-brand-green/10' : 'text-brand-orange hover:bg-brand-orange/10 animate-pulse'
            )} title={apiKey ? 'AI Connected ✓' : 'Add API Key'}>
            <Settings size={16} />
          </button>
          {profile && (
            <button onClick={signOut} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-bg-elevated transition-all" title="Sign out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface/95 border-t border-white/[0.08] backdrop-blur-xl grid grid-cols-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-all',
              pathname === href ? 'text-brand-purple' : 'text-white/30'
            )}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
    </>
  )
}
