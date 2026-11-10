import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAudioRecorder } from './useAudioRecorder'

describe('useAudioRecorder', () => {
  let stopTrackMock: () => void

  beforeEach(() => {
    vi.useFakeTimers()
    stopTrackMock = vi.fn()

    const mockStream = {
      getTracks: () => [{ stop: stopTrackMock }],
    }

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    })

    class MockMediaRecorder {
      state: 'inactive' | 'recording' = 'inactive'
      ondataavailable: ((e: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      mimeType = 'audio/webm'

      static isTypeSupported = vi.fn().mockReturnValue(true)

      constructor() {
        this.state = 'inactive'
      }

      start() {
        this.state = 'recording'
      }

      stop() {
        this.state = 'inactive'
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['audio-content'], { type: 'audio/webm' }) })
        }
        if (this.onstop) {
          this.onstop()
        }
      }
    }

    vi.stubGlobal('MediaRecorder', MockMediaRecorder)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('inicia con los estados por defecto', () => {
    const { result } = renderHook(() => useAudioRecorder())
    expect(result.current.isRecording).toBe(false)
    expect(result.current.recordingTime).toBe(0)
    expect(result.current.audioBlob).toBeNull()
    expect(result.current.permissionError).toBeNull()
  })

  it('informa error si el navegador no soporta grabación', async () => {
    vi.stubGlobal('MediaRecorder', undefined)
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.permissionError).toBe('Tu navegador no permite grabar audio.')
    expect(result.current.isRecording).toBe(false)
  })

  it('informa error si el usuario rechaza los permisos de micrófono', async () => {
    const notAllowed = new Error('Permission denied')
    notAllowed.name = 'NotAllowedError'
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(notAllowed),
      },
    })

    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.permissionError).toBe('Permiso de micrófono denegado.')
    expect(result.current.isRecording).toBe(false)
  })

  it('inicia la grabación y actualiza el cronómetro cada segundo', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(true)
    expect(result.current.recordingTime).toBe(0)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.recordingTime).toBe(3)
  })

  it('detiene la grabación y empaqueta el audioBlob', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    act(() => {
      result.current.stopRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.audioBlob).toBeInstanceOf(Blob)
    expect(stopTrackMock).toHaveBeenCalled()
  })

  it('cancela la grabación descartando el audioBlob y reseteando el tiempo', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.cancelRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.recordingTime).toBe(0)
    expect(result.current.audioBlob).toBeNull()
  })

  it('resetAudio limpia el audioBlob y los estados asociados', async () => {
    const { result } = renderHook(() => useAudioRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    act(() => {
      result.current.stopRecording()
    })

    expect(result.current.audioBlob).not.toBeNull()

    act(() => {
      result.current.resetAudio()
    })

    expect(result.current.audioBlob).toBeNull()
    expect(result.current.recordingTime).toBe(0)
    expect(result.current.permissionError).toBeNull()
  })
})

