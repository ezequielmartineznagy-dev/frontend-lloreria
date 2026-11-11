import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme hook', () => {
  let mediaQueryListeners: Array<() => void> = []
  let matchesDark = false

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mediaQueryListeners = []
    matchesDark = false

    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) => {
        mediaQueryListeners.push(listener)
      },
      removeEventListener: (_: string, listener: () => void) => {
        mediaQueryListeners = mediaQueryListeners.filter((l) => l !== listener)
      },
      dispatchEvent: vi.fn(),
    })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('inicializa por defecto en "system" y no añade "dark" si el sistema es claro', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('añade "dark" en modo "system" si matchMedia es oscuro', () => {
    matchesDark = true
    renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('cambia explícitamente a "dark" y persiste en localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('la-lloreria-theme')).toBe('dark')
  })

  it('cambia explícitamente a "light" y remueve la clase "dark"', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('la-lloreria-theme')).toBe('light')
  })

  it('lee el tema previamente guardado en localStorage', () => {
    localStorage.setItem('la-lloreria-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reacciona al cambio de preferencia del sistema si está en "system"', () => {
    matchesDark = false
    renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      matchesDark = true
      mediaQueryListeners.forEach((l) => l())
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

