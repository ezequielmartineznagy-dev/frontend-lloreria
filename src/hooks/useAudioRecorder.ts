import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseAudioRecorderReturn {
  isRecording: boolean
  recordingTime: number
  audioBlob: Blob | null
  permissionError: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  cancelRecording: () => void
  resetAudio: () => void
}

/**
 * Hook para gestionar la grabación de audio con la API nativa MediaRecorder.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const isCancelledRef = useRef<boolean>(false)

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    setPermissionError(null)
    setAudioBlob(null)
    setRecordingTime(0)
    isCancelledRef.current = false

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setPermissionError('Tu navegador no permite grabar audio.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      let mimeType = ''
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        if (!isCancelledRef.current && chunksRef.current.length > 0) {
          const finalMime = recorder.mimeType || mimeType || 'audio/webm'
          const blob = new Blob(chunksRef.current, { type: finalMime })
          setAudioBlob(blob)
        }
        chunksRef.current = []
        cleanupStream()
        stopTimer()
        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err: unknown) {
      cleanupStream()
      stopTimer()
      setIsRecording(false)
      const errorMsg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado.'
          : 'No pudimos acceder al micrófono. Revisá los permisos.'
      setPermissionError(errorMsg)
    }
  }, [cleanupStream, stopTimer])

  const stopRecording = useCallback(() => {
    isCancelledRef.current = false
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      cleanupStream()
      setIsRecording(false)
    }
  }, [cleanupStream, stopTimer])

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true
    stopTimer()
    setRecordingTime(0)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      chunksRef.current = []
      cleanupStream()
      setIsRecording(false)
    }
  }, [cleanupStream, stopTimer])

  const resetAudio = useCallback(() => {
    setAudioBlob(null)
    setRecordingTime(0)
    setPermissionError(null)
  }, [])

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      isCancelledRef.current = true
      stopTimer()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      cleanupStream()
    }
  }, [cleanupStream, stopTimer])

  return {
    isRecording,
    recordingTime,
    audioBlob,
    permissionError,
    startRecording,
    stopRecording,
    cancelRecording,
    resetAudio,
  }
}

export default useAudioRecorder

