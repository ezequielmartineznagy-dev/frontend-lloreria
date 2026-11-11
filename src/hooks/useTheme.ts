import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'la-lloreria-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch {
      // Fallback si localStorage no está disponible
    }
    return 'system'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // Ignorar errores de localStorage
    }
  }

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      let isDark = false
      if (theme === 'dark') {
        isDark = true
      } else if (theme === 'light') {
        isDark = false
      } else {
        isDark = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
      }

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()

      mediaQuery.addEventListener?.('change', handleChange)
      return () => mediaQuery.removeEventListener?.('change', handleChange)
    }
  }, [theme])

  return { theme, setTheme }
}

export default useTheme

