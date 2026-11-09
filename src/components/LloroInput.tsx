import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, SendHorizontal, Square, X } from 'lucide-react'

interface LloroInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** Se llama al terminar una grabación de voz con el audio resultante. */
  onVoiceRecord?: (audio: Blob) => void
  placeholder?: string
  className?: string
}

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export const LloroInput: React.FC<LloroInputProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceRecord,
  placeholder = '¿Qué pasó hoy?',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const discardRef = useRef(false)

  const hasText = value.trim().length > 0
  const canRecord = Boolean(onVoiceRecord)

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setIsRecording(false)
    setSeconds(0)
  }, [])

  // Detiene y descarta cualquier grabación si el componente se desmonta.
  useEffect(() => {
    return () => {
      discardRef.current = true
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      cleanup()
    }
  }, [cleanup])

  const startRecording = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Tu navegador no permite grabar audio.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      discardRef.current = false

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const shouldSend = !discardRef.current && chunksRef.current.length > 0
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        chunksRef.current = []
        cleanup()
        if (shouldSend) onVoiceRecord?.(blob)
      }

      streamRef.current = stream
      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('No pudimos acceder al micrófono. Revisá los permisos.')
    }
  }

  const stopRecording = (discard: boolean) => {
    discardRef.current = discard
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    } else {
      cleanup()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRecording) {
      stopRecording(false)
      return
    }
    if (hasText) onSubmit()
  }

  const iconButton =
    'flex-shrink-0 rounded-full transition-all duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]'

  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 w-full bg-[#161F33] rounded-full px-6 py-4 shadow-lg border border-transparent focus-within:border-[#4EA8DE]/30 transition-all duration-200"
        aria-label="Formulario para desahogarse"
      >
        {isRecording ? (
          <>
            <span className="relative flex h-3 w-3 flex-shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4EA8DE] opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#4EA8DE]" />
            </span>
            <p
              className="flex-1 font-['Lato',sans-serif] text-base md:text-lg text-white"
              role="timer"
              aria-live="off"
            >
              Grabando… <span className="text-[#8E9CAE] tabular-nums">{formatTime(seconds)}</span>
            </p>
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className={`${iconButton} p-1 text-[#8E9CAE] hover:text-white`}
              aria-label="Cancelar grabación"
              title="Cancelar"
            >
              <X className="w-6 h-6 stroke-[1.75]" />
            </button>
            <button
              type="submit"
              className={`${iconButton} -my-1 flex h-8 w-8 items-center justify-center bg-[#4EA8DE] text-[#0E131F] hover:brightness-110`}
              aria-label="Detener y enviar grabación"
              title="Enviar grabación"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 bg-transparent text-white placeholder-[#8E9CAE] focus:outline-none font-['Lato',sans-serif] text-base md:text-lg caret-[#4EA8DE]"
              aria-label="Escribe tu desahogo"
            />
            {canRecord && (
              <button
                type="button"
                onClick={startRecording}
                className={`${iconButton} p-1 text-[#8E9CAE] hover:text-[#4EA8DE]`}
                aria-label="Grabar mensaje de voz"
                title="Grabar voz"
              >
                <Mic className="w-6 h-6 stroke-[1.75]" />
              </button>
            )}
            <button
              type="submit"
              disabled={!hasText}
              className={`${iconButton} -my-1 flex h-8 w-8 items-center justify-center bg-[#4EA8DE] text-[#0E131F] hover:brightness-110 disabled:active:scale-100 disabled:bg-[#8E9CAE]/15 disabled:text-[#8E9CAE] disabled:cursor-default disabled:hover:brightness-100`}
              aria-label="Enviar mensaje"
              title="Enviar"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </>
        )}
      </form>
      {error && (
        <p role="alert" className="mt-2 px-6 font-['Lato',sans-serif] text-sm text-[#8E9CAE]">
          {error}
        </p>
      )}
    </div>
  )
}

export default LloroInput
