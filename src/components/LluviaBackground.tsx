import React from 'react'

// Generador pseudoaleatorio con semilla: el fondo es estable entre renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)
const between = (a: number, b: number) => a + rand() * (b - a)

// Capa lejana: estelas verticales finas y continuas
const STREAKS = Array.from({ length: 22 }, () => ({
  left: between(0, 100),
  height: between(60, 150),
  duration: between(2.4, 5),
  delay: -between(0, 5),
  opacity: between(0.05, 0.14),
}))

// Microgotas desenfocadas, lentas y casi transparentes
const MICRO = Array.from({ length: 14 }, () => ({
  left: between(2, 98),
  size: between(3, 6),
  duration: between(9, 17),
  delay: -between(0, 17),
  opacity: between(0.15, 0.3),
}))

export const LluviaBackground: React.FC = () => (
  <div aria-hidden="true" className="lluvia-bg pointer-events-none absolute inset-0 overflow-hidden">
    {STREAKS.map((s, i) => (
      <span
        key={`s${i}`}
        className="absolute top-0 w-px bg-gradient-to-b from-transparent via-[#4EA8DE] to-transparent"
        style={{
          left: `${s.left}%`,
          height: s.height,
          opacity: s.opacity,
          animation: `lloro-streak ${s.duration}s linear ${s.delay}s infinite`,
        }}
      />
    ))}
    {MICRO.map((m, i) => (
      <span
        key={`m${i}`}
        className="absolute top-0 rounded-full bg-[#4EA8DE] blur-[1.5px]"
        style={{
          left: `${m.left}%`,
          width: m.size,
          height: m.size * 1.4,
          opacity: m.opacity,
          animation: `lloro-streak ${m.duration}s linear ${m.delay}s infinite`,
        }}
      />
    ))}
    {/* Charco tenue donde se condensan las lágrimas */}
    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#4EA8DE]/[0.07] to-transparent" />
  </div>
)

export default LluviaBackground

