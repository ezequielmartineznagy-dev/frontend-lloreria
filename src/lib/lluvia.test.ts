import { describe, expect, it } from 'vitest'
import { LANES, canSpawn, createDrop, scaleOf, speedOf, tierOf } from './lluvia'

describe('lluvia', () => {
  it('escala y velocidad crecen con el nivel', () => {
    expect(scaleOf(1)).toBe(0.7)
    expect(scaleOf(10)).toBe(1.4)
    expect(speedOf(1)).toBe(5)
    expect(speedOf(10)).toBe(12)
  })

  it('clasifica los niveles', () => {
    expect([1, 3, 4, 7, 8, 10].map(tierOf)).toEqual(['leve', 'leve', 'medio', 'medio', 'colapso', 'colapso'])
  })

  it('crea gotas dentro del rango horizontal permitido', () => {
    for (let lane = 0; lane < LANES.length; lane++) {
      for (const r of [0, 0.5, 1]) {
        const d = createDrop('x', 't', 5, lane, 0, () => r)
        expect(d.xPosition).toBeGreaterThanOrEqual(5)
        expect(d.xPosition).toBeLessThanOrEqual(85)
      }
    }
  })

  it('acota el nivel entre 1 y 10', () => {
    expect(createDrop('x', 't', 99, 0).level).toBe(10)
    expect(createDrop('x', 't', -3, 0).level).toBe(1)
  })

  describe('canSpawn', () => {
    const travel = 800
    const h = 160
    const lead = { start: 0, end: 8000 }

    it('rechaza arrancar demasiado pegado a otra gota', () => {
      expect(canSpawn([lead], { start: 500, end: 8500 }, travel, h)).toBe(false)
    })

    it('acepta si hay separación suficiente', () => {
      expect(canSpawn([lead], { start: 3000, end: 11000 }, travel, h)).toBe(true)
    })

    it('rechaza una gota más rápida que alcanzaría a la de adelante', () => {
      expect(canSpawn([lead], { start: 3000, end: 6000 }, travel, h)).toBe(false)
    })
  })
})

