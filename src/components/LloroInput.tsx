import React, { useEffect } from 'react'
import { Mic, SendHorizontal, StopCircle, Trash2 } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

export interface LloroInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** Se llama al terminar una grabación de voz con el audio resultante. */
  onVoiceRecord?: (audio: Blob) => void
  placeholder?: string
  className?: string

  // Props opcionales para control directo desde useAudioRecorder
  isRecording?: boolean
  recordingTime?: number
  onStartRecording?: () => void
  onStopRecording?: () => void
  onCancelRecording?: () => void
  permissionError?: string | null
}

const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export const LloroInput: React.FC<LloroInputProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceRecord,
  placeholder = '¿Qué pasó hoy?',
  className = '',
  isRecording: controlledIsRecording,
  recordingTime: controlledRecordingTime,
  onStartRecording: controlledStartRecording,
  onStopRecording: controlledStopRecording,
  onCancelRecording: controlledCancelRecording,
  permissionError: controlledPermissionError,
}) => {
  const internalRecorder = useAudioRecorder()
  const isControlled = typeof controlledIsRecording === 'boolean'

  const isRecording = isControlled ? controlledIsRecording : internalRecorder.isRecording
  const recordingTime = isControlled ? (controlledRecordingTime ?? 0) : internalRecorder.recordingTime
  const permissionError = isControlled ? controlledPermissionError : internalRecorder.permissionError
  const startRecording = isControlled ? controlledStartRecording : internalRecorder.startRecording
  const stopRecording = isControlled ? controlledStopRecording : internalRecorder.stopRecording
  const cancelRecording = isControlled ? controlledCancelRecording : internalRecorder.cancelRecording

  const hasText = value.trim().length > 0
  const canRecord = Boolean(onVoiceRecord || controlledStartRecording)

  // En modo no controlado, notificar al terminar grabación con el blob
  useEffect(() => {
    if (!isControlled && internalRecorder.audioBlob) {
      onVoiceRecord?.(internalRecorder.audioBlob)
      internalRecorder.resetAudio()
    }
  }, [isControlled, internalRecorder.audioBlob, internalRecorder, onVoiceRecord])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRecording) {
      stopRecording?.()
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
        className="relative flex items-center justify-between gap-2 w-full bg-[#161F33] rounded-full px-6 py-4 shadow-lg border border-transparent focus-within:border-[#4EA8DE]/30 transition-all duration-200"
        aria-label="Formulario para desahogarse"
      >
        {isRecording ? (
          <>
            {/* Botón cancelar a la izquierda */}
            <button
              type="button"
              onClick={cancelRecording}
              className={`${iconButton} p-1 text-[#8E9CAE] hover:text-[#C94A4A] transition-colors`}
              aria-label="Cancelar grabación"
              title="Cancelar grabación"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Indicador de grabación centrado */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <span
                className="w-2.5 h-2.5 bg-[#C94A4A] rounded-full animate-pulse"
                aria-hidden="true"
              />
              <span
                className="font-['Lato',sans-serif] font-bold text-[#C94A4A] text-base md:text-lg tabular-nums"
                role="timer"
                aria-live="off"
              >
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Botón detener / enviar a la derecha */}
            <button
              type="button"
              onClick={stopRecording}
              className={`${iconButton} p-1 text-[#4EA8DE] hover:brightness-110`}
              aria-label="Detener y enviar grabación"
              title="Detener y enviar"
            >
              <StopCircle className="w-6 h-6" />
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
      {permissionError && (
        <p role="alert" className="mt-2 px-6 font-['Lato',sans-serif] text-sm text-[#C94A4A]">
          {permissionError}
        </p>
      )}
    </div>
  )
}

export default LloroInput
