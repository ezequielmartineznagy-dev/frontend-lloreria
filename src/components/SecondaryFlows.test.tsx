import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EditProfileModal } from './EditProfileModal'
import { ThinkingState } from './ThinkingState'

describe('EditProfileModal', () => {
  const setup = (isOpen = true) => {
    const props = { isOpen, onClose: vi.fn(), currentUsername: 'Llorón', onSave: vi.fn() }
    render(<EditProfileModal {...props} />)
    return props
  }

  it('no renderiza cerrado', () => {
    setup(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('precarga el nombre actual y enfoca el input', () => {
    setup()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Editar Perfil')
    const input = screen.getByLabelText('Nombre de usuario')
    expect(input).toHaveValue('Llorón')
    expect(input).toHaveFocus()
  })

  it('guarda el nombre recortado', async () => {
    const props = setup()
    const input = screen.getByLabelText('Nombre de usuario')
    await userEvent.clear(input)
    await userEvent.type(input, '  Nuevo  {Enter}')
    expect(props.onSave).toHaveBeenCalledWith('Nuevo')
  })

  it('no permite guardar un nombre vacío', async () => {
    const props = setup()
    await userEvent.clear(screen.getByLabelText('Nombre de usuario'))
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    expect(props.onSave).not.toHaveBeenCalled()
  })

  it('se cierra con Escape', async () => {
    const props = setup()
    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })
})

describe('ThinkingState', () => {
  it('no renderiza si no es visible', () => {
    render(<ThinkingState isVisible={false} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('muestra el mensaje por defecto y uno personalizado', () => {
    const { rerender } = render(<ThinkingState isVisible />)
    expect(screen.getByRole('status')).toHaveTextContent('Analizando tu nivel de drama...')
    rerender(<ThinkingState isVisible message="Pensando..." />)
    expect(screen.getByRole('status')).toHaveTextContent('Pensando...')
  })
})
