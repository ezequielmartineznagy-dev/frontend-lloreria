export interface LloroDrop {
  id: string
  text: string
  level: number // 1 al 10 (Llorómetro)
  xPosition: number // % del borde izquierdo, 5 a 85
  speed: number // duración de la caída en segundos
  scale: number // escala proporcional al peso
  delay: number // desfase inicial en segundos
}

export type Tier = 'leve' | 'medio' | 'colapso'

/** Carriles horizontales (% del ancho). Cada gota ocupa ~29 % del ancho, así que no se pisan en X. */
export const LANES = [5, 36, 67]

export const tierOf = (level: number): Tier => (level <= 3 ? 'leve' : level <= 7 ? 'medio' : 'colapso')

/** 0.7 (nivel 1) → 1.4 (nivel 10) */
export const scaleOf = (level: number) => +(0.7 + ((level - 1) * 0.7) / 9).toFixed(3)

/** Cuanto más pesa, más lento cae: 5 s (nivel 1) → 12 s (nivel 10). */
export const speedOf = (level: number) => +(5 + ((level - 1) * 7) / 9).toFixed(2)

export function createDrop(
  id: string,
  text: string,
  level: number,
  lane: number,
  delay = 0,
  rand: () => number = Math.random,
): LloroDrop {
  const lvl = Math.min(10, Math.max(1, Math.round(level)))
  const jitter = (rand() - 0.5) * 4 // ±2 %
  const xPosition = Math.min(85, Math.max(5, LANES[lane] + jitter))
  return { id, text, level: lvl, xPosition, speed: speedOf(lvl), scale: scaleOf(lvl), delay }
}

export interface Timing {
  start: number // ms
  end: number // ms
}

/** Alto aproximado (px) de una gota con su globo de texto. */
export const itemHeight = (scale: number) => 90 * scale + 70

/**
 * Con caída lineal, dos gotas del mismo carril no se pisan si la de atrás
 * arranca después y también llega después, dejando al menos un alto de separación.
 */
export function canSpawn(others: Timing[], candidate: Timing, travelPx: number, heightPx: number): boolean {
  const margin = 1.15 * heightPx
  return others.every((other) => {
    const [ahead, behind] = other.start <= candidate.start ? [other, candidate] : [candidate, other]
    const gapStart = (margin * (ahead.end - ahead.start)) / travelPx
    const gapEnd = (margin * (behind.end - behind.start)) / travelPx
    return behind.start >= ahead.start + gapStart && behind.end >= ahead.end + gapEnd
  })
}

// TODO: reemplazar por los lloros reales de la comunidad (backend)
export const MOCK_LLOROS: { text: string; level: number }[] = [
  { text: 'La crisis existencial me está ganando', level: 10 },
  { text: 'Siento que todos avanzan menos yo', level: 9 },
  { text: 'Rendí mal el final y quiero desaparecer', level: 9 },
  { text: 'Mi ex vio mi historia y no dijo nada', level: 8 },
  { text: 'Tengo que madurar', level: 7 },
  { text: 'Nadie leyó mi mensaje largo', level: 7 },
  { text: 'Se me rompió la taza favorita', level: 6 },
  { text: 'Hoy dormí 4 horas y el mundo me debe una disculpa', level: 6 },
  { text: 'No me contestó…', level: 5 },
  { text: 'Se me cortó la leche', level: 5 },
  { text: 'Llegué tarde y el bondi se fue en mi cara', level: 4 },
  { text: 'Se me cayó la tostada', level: 3 },
  { text: 'Me llovió sin paraguas', level: 3 },
  { text: 'Me quedé sin wifi en plena serie', level: 2 },
  { text: 'El lunes existe', level: 2 },
  { text: 'Me da paja todo', level: 1 },
]

