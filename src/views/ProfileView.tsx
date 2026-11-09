import React from 'react'
import * as Switch from '@radix-ui/react-switch'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Gotita } from '../components/Gotita'

type Theme = 'claro' | 'oscuro' | 'automatico'

interface ProfileStats {
  volumen: string // ej. "3.8 L"
  dramaPromedio: string // ej. "7.2"
  rachaActiva: string // ej. "14 días"
}

interface ProfileViewProps {
  onBack: () => void
  username: string
  stats: ProfileStats
  onEditProfile: () => void
  onThemeChange: (theme: Theme) => void
  currentTheme: Theme
  alarmTime: string // ej. "20:00 hs"
  isAlarmEnabled: boolean
  onToggleAlarm: (enabled: boolean) => void
  onClearHistory: () => void
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'claro', label: 'Claro' },
  { value: 'oscuro', label: 'Oscuro' },
  { value: 'automatico', label: 'Automático' },
]

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  username,
  stats,
  onEditProfile,
  onThemeChange,
  currentTheme,
  alarmTime,
  isAlarmEnabled,
  onToggleAlarm,
  onClearHistory,
}) => {
  const statCards = [
    { value: stats.volumen, label: 'Volumen' },
    { value: stats.dramaPromedio, label: 'Drama promedio' },
    { value: stats.rachaActiva, label: 'Racha activa' },
  ]

  return (
    <main className="h-[100dvh] w-full overflow-y-auto bg-[#0E131F]">
      <div className="w-full max-w-md mx-auto min-h-full px-6 py-6 flex flex-col">
        <header className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="text-[#8E9CAE] hover:text-white transition-colors cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="font-['Quicksand',sans-serif] font-bold text-2xl text-white">Perfil</h1>
          <span className="w-6" aria-hidden="true" />
        </header>

        <section aria-label="Identidad" className="flex flex-col items-center text-center mb-8">
          <div className="w-32 h-32 border-2 border-[#4EA8DE]/40 rounded-full bg-[#161F33] flex items-center justify-center">
            <Gotita size={90} />
          </div>
          <h2 className="font-['Quicksand',sans-serif] font-bold text-xl text-white mt-4">
            {username}
          </h2>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161F33] border border-[#8E9CAE]/20 text-xs font-['Lato',sans-serif] text-[#8E9CAE] hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <Pencil size={11} aria-hidden="true" />
            Editar perfil
          </button>
        </section>

        <section aria-label="Estadísticas" className="grid grid-cols-3 gap-3 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-[#161F33] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center"
            >
              <p className="font-['Quicksand',sans-serif] font-bold text-lg md:text-xl text-[#4EA8DE] mb-1">
                {s.value}
              </p>
              <p className="font-['Lato',sans-serif] text-[11px] font-medium text-[#8E9CAE] leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        <section aria-labelledby="ajustes-title" className="flex flex-col">
          <h2
            id="ajustes-title"
            className="font-['Quicksand',sans-serif] font-bold text-lg text-white mb-3 self-start"
          >
            Ajustes
          </h2>

          <div className="bg-[#161F33] border border-white/5 rounded-3xl overflow-hidden flex flex-col divide-y divide-white/5">
            <div className="p-5 flex flex-col gap-3">
              <p id="tema-label" className="font-['Lato',sans-serif] text-[15px] font-medium text-white">
                Tema visual
              </p>
              <div
                role="radiogroup"
                aria-labelledby="tema-label"
                className="grid grid-cols-3 bg-[#0E131F] p-1 rounded-full border border-white/5"
              >
                {THEMES.map((t) => {
                  const selected = t.value === currentTheme
                  return (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onThemeChange(t.value)}
                      className={`py-2 rounded-full font-['Quicksand',sans-serif] text-xs text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE] ${
                        selected
                          ? 'font-bold bg-[#4EA8DE] text-[#0E131F] shadow-md shadow-[#4EA8DE]/15'
                          : 'font-medium text-[#8E9CAE] hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p
                  id="alarma-label"
                  className="font-['Lato',sans-serif] text-[15px] font-medium text-white"
                >
                  Alarma de desahogo
                </p>
                <p className="font-['Lato',sans-serif] text-xs text-[#8E9CAE] mt-0.5">{alarmTime}</p>
              </div>
              <Switch.Root
                checked={isAlarmEnabled}
                onCheckedChange={onToggleAlarm}
                aria-labelledby="alarma-label"
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]/60 data-[state=checked]:bg-[#4EA8DE] data-[state=unchecked]:bg-[#0E131F] data-[state=unchecked]:border data-[state=unchecked]:border-white/10"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-6 text-center">
          <button
            type="button"
            onClick={onClearHistory}
            className="font-['Lato',sans-serif] text-xs text-red-400/80 hover:text-red-400 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded"
          >
            Borrar todo mi historial de penas
          </button>
        </footer>
      </div>
    </main>
  )
}

export default ProfileView

