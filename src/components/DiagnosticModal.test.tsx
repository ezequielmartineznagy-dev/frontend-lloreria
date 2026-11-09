import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DiagnosticModal } from './DiagnosticModal'

const setup = (isOpen = true) => {
  const props = {
    isOpen,
    onClose: vi.fn(),
    diagnosisText: 'Es un 50/50.',
    onAcceptDestiny: vi.fn(),
    onShareDrama: vi.fn(),
  }
  render(<DiagnosticModal {...props} />)
  return props
}

describe('DiagnosticModal', () => {
  it('no renderiza nada cuando está cerrado', () => {
    setup(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza un diálogo accesible con el diagnóstico', () => {
    setup()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Diagnóstico')
    expect(dialog).toHaveAccessibleDescription('Es un 50/50.')
  })

  it('enfoca el botón primario al abrir', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Aceptar mi destino' })).toHaveFocus()
  })

  it('dispara onAcceptDestiny y onShareDrama', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Aceptar mi destino' }))
    await userEvent.click(screen.getByRole('button', { name: 'Compartir drama' }))
    expect(props.onAcceptDestiny).toHaveBeenCalledTimes(1)
    expect(props.onShareDrama).toHaveBeenCalledTimes(1)
  })

  it('se cierra con Escape', async () => {
    const props = setup()
    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('atrapa el foco con Tab', async () => {
    setup()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Compartir drama' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Aceptar mi destino' })).toHaveFocus()
  })
})

