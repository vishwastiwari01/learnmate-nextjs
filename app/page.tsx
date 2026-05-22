'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import LandingDark from './LandingDark'
import LandingLight from './LandingLight'

export default function Page() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return theme === 'light' ? (
    <LandingLight toggleTheme={toggleTheme} theme={theme} />
  ) : (
    <LandingDark toggleTheme={toggleTheme} theme={theme} />
  )
}
