import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { GotaItem } from '../components/GotaItem'
import { LluviaBackground } from '../components/LluviaBackground'
import {
  LANES,
  MOCK_LLOROS,
  canSpawn,
  createDrop,
  itemHeight,
  type LloroDrop,
  type Timing,
} from '../lib/lluvia'

interface LluviaFeedViewProps {
  onBack: () => void
  /** Lloros de la comunidad. TODO: reemplazar por datos reales del backend. */
  lloros?: { text: string; level: number }[]
}

interface Splash {
  id: string
  left: string
  size: number
}

const MAX_VISIBLE = 9
const SPAWN_EVERY_MS = 1300
const HOLD_MS = 3500

const shuffle = <T,>(items: T[]) => {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const LluviaFeedView: React.FC<LluviaFeedViewProps> = ({ onBack, lloros = MOCK_LLOROS }) => {
  const [drops, setDrops] = useState<(LloroDrop & { lane: number })[]>([])
  const [splashes, setSplashes] = useState<Splash[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const timings = useRef(new Map<string, Timing & { lane: number; pausedAt?: number }>())
  const queue = useRef<typeof lloros>([])
  const counter = useRef(0)
  const holdTimer = useRef<number | null>(null)
  // Texto por id, para no repetir lloros visibles a la vez.
  const dropTexts = useRef(new Map<string, string>())

  const spawn = useCallback(
    (delaySec: number) => {
      if (timings.current.size >= MAX_VISIBLE || lloros.length === 0) return

      const onScreen = new Set(
        [...timings.current.keys()].map((id) => dropTexts.current.get(id)),
      )
      if (queue.current.length === 0) queue.current = shuffle(lloros)
      const idx = queue.current.findIndex((l) => !onScreen.has(l.text))
      if (idx === -1) return
      const lloro = queue.current[idx]

      const now = performance.now()
      const travel = window.innerHeight * 1.25 - 176

      for (const lane of shuffle(LANES.map((_, i) => i))) {
        const id = `d${counter.current}`
        const drop = createDrop(id, lloro.text, lloro.level, lane, delaySec)
        const timing: Timing = {
          start: now + delaySec * 1000,
          end: now + (delaySec + drop.speed) * 1000,
        }
        const others = [...timings.current.values()].filter((t) => t.lane === lane)
        if (!canSpawn(others, timing, travel, itemHeight(drop.scale))) continue

        counter.current += 1
        queue.current.splice(idx, 1)
        timings.current.set(id, { ...timing, lane })
        dropTexts.current.set(id, drop.text)
        setDrops((prev) => [...prev, { ...drop, lane }])
        return
      }
    },
    [lloros],
  )

  useEffect(() => {
    const seeds = [0, 0.9, 1.8, 2.7, 3.6].map((d) => window.setTimeout(() => spawn(d), 0))
    const interval = window.setInterval(() => {
      if (!document.hidden) spawn(0)
    }, SPAWN_EVERY_MS)
    const timing = timings.current
    const texts = dropTexts.current

    return () => {
      seeds.forEach(window.clearTimeout)
      window.clearInterval(interval)
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
      timing.clear()
      texts.clear()
      setDrops([])
      setSplashes([])
    }
  }, [spawn])

  const release = useCallback((id: string) => {
    const t = timings.current.get(id)
    if (t?.pausedAt !== undefined) {
      // La gota estuvo detenida: se corre su agenda para que el carril siga siendo seguro.
      const paused = performance.now() - t.pausedAt
      t.start += paused
      t.end += paused
      t.pausedAt = undefined
    }
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
    setExpandedId((cur) => (cur === id ? null : cur))
  }, [])

  const handleTap = useCallback(
    (id: string) => {
      if (expandedId === id) {
        release(id)
        return
      }
      if (expandedId) release(expandedId)
      const t = timings.current.get(id)
      if (t) t.pausedAt = performance.now()
      setExpandedId(id)
      holdTimer.current = window.setTimeout(() => release(id), HOLD_MS)
    },
    [expandedId, release],
  )

  const handleEnd = useCallback((drop: LloroDrop) => {
    timings.current.delete(drop.id)
    dropTexts.current.delete(drop.id)
    setDrops((prev) => prev.filter((d) => d.id !== drop.id))
    setExpandedId((cur) => (cur === drop.id ? null : cur))
    setSplashes((prev) => [
      ...prev,
      {
        id: drop.id,
        left: `calc(${drop.xPosition}% + min(29cqw, 11rem) / 2)`,
        size: 22 + drop.level * 4,
      },
    ])
  }, [])

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0E131F]">
      <div className="@container relative mx-auto h-full w-full max-w-md overflow-hidden">
        <LluviaBackground />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="pointer-events-auto mt-1 rounded-full text-[#8E9CAE] transition-colors hover:text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <div className="text-center">
            <h1 className="font-['Quicksand',sans-serif] text-2xl font-bold text-white">Lloros y Lloros</h1>
            <p className="font-['Lato',sans-serif] text-sm text-[#8E9CAE]">Cuánta gente llorando</p>
          </div>
          <span className="w-6" aria-hidden="true" />
        </header>

        {/* Degradado superior: las gotas emergen de la oscuridad sin tapar el título */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#0E131F] via-[#0E131F]/70 to-transparent"
        />

        <div className="absolute inset-0">
          {drops.map((d) => (
            <GotaItem
              key={d.id}
              drop={d}
              expanded={expandedId === d.id}
              onTap={handleTap}
              onEnd={handleEnd}
            />
          ))}
        </div>

        {splashes.map((s) => (
          <div
            key={s.id}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-7"
            style={{ left: s.left }}
          >
            <span
              className="absolute bottom-0 left-0 block rounded-[50%] border border-[#4EA8DE]/60"
              style={{
                width: s.size * 2,
                height: s.size * 0.5,
                animation: 'lloro-ring 0.9s ease-out forwards',
              }}
              onAnimationEnd={() => setSplashes((prev) => prev.filter((p) => p.id !== s.id))}
            />
            {[-1, 0, 1].map((dir) => (
              <span
                key={dir}
                className="absolute bottom-0 left-0 block h-1 w-1 rounded-full bg-[#4EA8DE]"
                style={
                  {
                    '--dx': `${dir * 14}px`,
                    animation: 'lloro-spark 0.7s ease-out forwards',
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ))}

        {/* Alternativa accesible a la animación */}
        <ul className="sr-only" aria-label="Lloros de la comunidad">
          {lloros.map((l) => (
            <li key={l.text}>
              {l.text}. Nivel {l.level} de 10.
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default LluviaFeedView
