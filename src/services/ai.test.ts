import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateDiagnosis, generateGotitaReply } from './ai'

describe('services/ai', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve diagnóstico de respaldo si falta la API Key', async () => {
    const originalKey = import.meta.env.VITE_GEMINI_API_KEY
    import.meta.env.VITE_GEMINI_API_KEY = ''

    const diagnosis = await generateDiagnosis('Se me cayó el café')
    expect(typeof diagnosis).toBe('string')
    expect(diagnosis.length).toBeGreaterThan(0)

    import.meta.env.VITE_GEMINI_API_KEY = originalKey
  })

  it('devuelve respuesta de respaldo en chat si falta la API Key', async () => {
    const originalKey = import.meta.env.VITE_GEMINI_API_KEY
    import.meta.env.VITE_GEMINI_API_KEY = ''

    const reply = await generateGotitaReply('Hola Gotita')
    expect(typeof reply).toBe('string')
    expect(reply.length).toBeGreaterThan(0)

    import.meta.env.VITE_GEMINI_API_KEY = originalKey
  })
})

