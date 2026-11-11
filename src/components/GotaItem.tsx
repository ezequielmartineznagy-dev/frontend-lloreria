import React from 'react'
import { Droplet } from 'lucide-react'
import { Gotita } from './Gotita'
import { tierOf, type LloroDrop } from '../lib/lluvia'

interface GotaItemProps {
  drop: LloroDrop
  expanded: boolean
  onTap: (id: string) => void
  onEnd: (drop: LloroDrop) => void
}

const TIER_STYLE = {
  leve: {
    opacity: 0.6,
    z: 'z-0',
    capsule: 'border-slate-200 dark:border-white/5 bg-white/90 dark:bg-[#161F33]/80 shadow-sm dark:shadow-none',
    text: 'text-[11px] text-slate-500 dark:text-[#8E9CAE]',
    chip: 'text-slate-500 dark:text-[#8E9CAE]',
    gotita: '',
  },
  medio: {
    opacity: 0.95,
    z: 'z-[5]',
    capsule: 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#161F33] shadow-sm dark:shadow-none',
    text: 'text-[12.5px] text-slate-900 dark:text-white',
    chip: 'text-[#4EA8DE]',
    gotita: 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]',
  },
  colapso: {
    opacity: 1,
    z: 'z-10',
    capsule: 'border-[#4EA8DE]/30 dark:border-[#4EA8DE]/20 bg-white dark:bg-[#161F33] shadow-[0_0_28px_rgba(78,168,222,0.18)] dark:shadow-[0_0_28px_rgba(78,168,222,0.14)]',
    text: 'text-[13px] font-semibold text-slate-900 dark:text-white',
    chip: 'text-[#4EA8DE]',
    gotita: 'brightness-[0.85] drop-shadow-[0_0_22px_rgba(78,168,222,0.4)]',
  },
} as const

export const GotaItem: React.FC<GotaItemProps> = ({ drop, expanded, onTap, onEnd }) => {
  const tier = tierOf(drop.level)
  const s = TIER_STYLE[tier]

  const style = {
    left: `${drop.xPosition}%`,
    width: 'min(29cqw, 11rem)',
    animation: `lloro-fall ${drop.speed}s linear ${drop.delay}s both`,
    animationPlayState: expanded ? 'paused' : 'running',
    '--lloro-opacity': s.opacity,
  } as React.CSSProperties

  return (
    <div
      aria-hidden="true"
      className={`absolute top-0 flex flex-col items-center will-change-transform select-none ${
        expanded ? 'z-30' : s.z
      }`}
      style={style}
      onClick={() => onTap(drop.id)}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onEnd(drop)
      }}
    >
      <div className="relative cursor-pointer">
        {tier === 'colapso' && (
          <span
            className="absolute inset-0 -z-10 scale-[2.2] rounded-full bg-[radial-gradient(circle,rgba(78,168,222,0.22)_0%,transparent_65%)]"
            style={{ animation: 'lloro-breathe 4s ease-in-out infinite' }}
          />
        )}
        <Gotita size={52 * drop.scale} className={s.gotita} />
      </div>

      <div
        className={`mt-1.5 w-full cursor-pointer rounded-2xl border px-2.5 py-2 text-center transition-transform duration-300 ${s.capsule} ${
          expanded ? 'scale-[1.08]' : ''
        }`}
      >
        <p
          className={`font-['Lato',sans-serif] leading-snug ${s.text} ${expanded ? '' : 'line-clamp-3'}`}
        >
          {drop.text}
        </p>
        <span
          className={`mt-1 inline-flex items-center gap-0.5 font-['Quicksand',sans-serif] text-[11px] font-bold ${s.chip}`}
        >
          <Droplet size={10} className="fill-current" />
          {drop.level}
        </span>
      </div>
    </div>
  )
}

export default GotaItem

