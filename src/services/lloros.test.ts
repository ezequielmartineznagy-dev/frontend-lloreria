import { beforeEach, describe, expect, it } from 'vitest'
import { INITIAL_DROPS, getStoredDrops, saveDrop } from './lloros'

describe('services/lloros', () => {
  beforeEach(() => localStorage.clear())

  it('devuelve los 7 lloros iniciales sin datos guardados', () => {
    expect(getStoredDrops()).toEqual(INITIAL_DROPS)
    expect(INITIAL_DROPS).toHaveLength(7)
  })

  it('guarda el nuevo lloro al principio y lo persiste', () => {
    const item = saveDrop('Se me cortó la leche', 6)
    const stored = getStoredDrops()
    expect(stored[0].id).toBe(item.id)
    expect(stored).toHaveLength(INITIAL_DROPS.length + 1)
    expect(stored[0].timestamp).toBeInstanceOf(Date)
  })

  it('acota el nivel entre 1 y 10', () => {
    expect(saveDrop('a', 99).level).toBe(10)
    expect(saveDrop('b', 0).level).toBe(1)
  })

  it('ignora datos corruptos', () => {
    localStorage.setItem('lalloreria:drops', '{no es json')
    expect(getStoredDrops()).toEqual(INITIAL_DROPS)
  })
})
