import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatView, type ChatMessage } from './ChatView'

const messages: ChatMessage[] = [
  { id: '1', sender: 'user', text: 'Se me cortó la leche' },
  { id: '2', sender: 'gotita', text: 'Tragedia.' },
]

const setup = (extra: Partial<React.ComponentProps<typeof ChatView>> = {}) => {
  const props = { messages, onBack: vi.fn(), onSendMessage: vi.fn(), ...extra }
  render(<ChatView {...props} />)
  return props
}

describe('ChatView', () => {
  it('renderiza el historial como lista', () => {
    setup()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Tragedia.')).toBeInTheDocument()
  })

  it('envía el borrador y lo limpia', async () => {
    const props = setup()
    const input = screen.getByLabelText('¿Qué pasó hoy?')
    await userEvent.type(input, 'hola{Enter}')
    expect(props.onSendMessage).toHaveBeenCalledWith('hola')
    expect(input).toHaveValue('')
  })

  it('deshabilita enviar sin texto', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
  })

  it('muestra el micrófono solo con onVoiceRecord y lo dispara', async () => {
    const onVoiceRecord = vi.fn()
    setup({ onVoiceRecord })
    await userEvent.click(screen.getByRole('button', { name: 'Grabar mensaje de voz' }))
    expect(onVoiceRecord).toHaveBeenCalledTimes(1)
  })

  it('vuelve con la flecha', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(props.onBack).toHaveBeenCalledTimes(1)
  })
})
