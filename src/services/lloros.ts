export interface LloroItem {
  id: string
  text: string
  level: number
  timestamp: Date
}

const STORAGE_KEY = 'lalloreria:drops'
const MAX_STORED = 50

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000)

export const INITIAL_DROPS: LloroItem[] = [
  { id: 'seed-1', text: 'La crisis existencial me está ganando', level: 10, timestamp: hoursAgo(1) },
  { id: 'seed-2', text: 'Rendí mal el final y quiero desaparecer', level: 9, timestamp: hoursAgo(2) },
  { id: 'seed-3', text: 'Tengo que madurar', level: 7, timestamp: hoursAgo(3) },
  { id: 'seed-4', text: 'Se me rompió la taza favorita', level: 6, timestamp: hoursAgo(5) },
  { id: 'seed-5', text: 'No me contestó…', level: 5, timestamp: hoursAgo(8) },
  { id: 'seed-6', text: 'Se me cayó la tostada', level: 3, timestamp: hoursAgo(12) },
  { id: 'seed-7', text: 'Me da paja todo', level: 1, timestamp: hoursAgo(20) },
]

interface StoredLloro {
  id: string
  text: string
  level: number
  timestamp: string
}

const isStored = (v: unknown): v is StoredLloro => {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.text === 'string' &&
    typeof o.level === 'number' &&
    typeof o.timestamp === 'string'
  )
}

// TODO: reemplazar por llamadas al backend (Supabase / Django)
export function getStoredDrops(): LloroItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_DROPS
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isStored)) return INITIAL_DROPS
    return parsed.map((d) => ({ ...d, timestamp: new Date(d.timestamp) }))
  } catch {
    return INITIAL_DROPS
  }
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `drop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

/** Guarda un lloro al principio del historial y lo devuelve. */
export function saveDrop(text: string, level: number): LloroItem {
  const item: LloroItem = {
    id: newId(),
    text,
    level: Math.min(10, Math.max(1, Math.round(level))),
    timestamp: new Date(),
  }
  const next = [item, ...getStoredDrops()].slice(0, MAX_STORED)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Almacenamiento lleno o bloqueado: el lloro igual se devuelve para mostrarlo en esta sesión
  }
  return item
}

