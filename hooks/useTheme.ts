'use client'
import { useEffect, useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check localStorage on mount
    const savedTheme = localStorage.getItem('learnmate-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(initialDark)
    applyTheme(initialDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    if (dark) {
      root.style.setProperty('--bg', '#07090F')
      root.style.setProperty('--bg1', '#0D1017')
      root.style.setProperty('--bg2', '#111520')
      root.style.setProperty('--bg3', '#161B28')
      root.style.setProperty('--text', '#EEF2FF')
      root.style.setProperty('--text2', '#8892A4')
      root.style.setProperty('--text3', '#4A5568')
      document.documentElement.classList.remove('light-theme')
    } else {
      root.style.setProperty('--bg', '#FFFFFF')
      root.style.setProperty('--bg1', '#F8F8F8')
      root.style.setProperty('--bg2', '#F0F0F0')
      root.style.setProperty('--bg3', '#E8E8E8')
      root.style.setProperty('--text', '#1A1A1A')
      root.style.setProperty('--text2', '#666666')
      root.style.setProperty('--text3', '#999999')
      document.documentElement.classList.add('light-theme')
    }
  }

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('learnmate-theme', newDark ? 'dark' : 'light')
    applyTheme(newDark)
  }

  return { isDark, toggleTheme, isMounted }
}
