import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LloroInput } from './LloroInput'

describe('LloroInput', () => {
  it('muestra el placeholder por defecto', () => {
    render(<LloroInput value="" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.getByPlaceholderText('¿Qué pasó hoy?')).toBeInTheDocument()
  })

  it('mantiene el botón de enviar deshabilitado sin texto', () => {
    render(<LloroInput value="" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
  })

  it('envía al hacer click en el botón', async () => {
    const onSubmit = vi.fn()
    render(<LloroInput value="hola" onChange={() => {}} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('envía al presionar Enter', async () => {
    const onSubmit = vi.fn()
    render(<LloroInput value="hola" onChange={() => {}} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('no envía con Enter si el texto está vacío', async () => {
    const onSubmit = vi.fn()
    render(<LloroInput value="  " onChange={() => {}} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no muestra el micrófono sin onVoiceRecord', () => {
    render(<LloroInput value="" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Grabar mensaje de voz' })).not.toBeInTheDocument()
  })

  it('informa un error si el navegador no soporta grabación', async () => {
    vi.stubGlobal('MediaRecorder', undefined)
    render(<LloroInput value="" onChange={() => {}} onSubmit={() => {}} onVoiceRecord={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Grabar mensaje de voz' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('no permite grabar')
    vi.unstubAllGlobals()
  })
})

