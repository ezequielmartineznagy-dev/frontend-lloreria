import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LlorometroTopSheet } from './LlorometroTopSheet'

const setup = (isOpen = true) => {
  const props = { isOpen, onClose: vi.fn(), onRelease: vi.fn() }
  render(<LlorometroTopSheet {...props} />)
  return props
}

describe('LlorometroTopSheet', () => {
  it('no renderiza cerrado', () => {
    setup(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra el título y el nivel inicial con su etiqueta', () => {
    setup()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('¿Cuánto pesa tu lloro?')
    expect(screen.getByText('Ojos vidriosos')).toBeInTheDocument()
  })

  it('sincroniza etiqueta y valor al mover el slider con el teclado', async () => {
    const props = setup()
    const slider = screen.getByRole('slider')
    slider.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('Llanto silencioso')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Soltar a la lluvia' }))
    expect(props.onRelease).toHaveBeenCalledWith(7)
  })

  it('se cierra con Escape', async () => {
    const props = setup()
    await userEvent.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })
})
