import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renderiza las 3 opciones de navegación en el orden solicitado (Muro, Inicio, Perfil)', () => {
    render(<BottomNav currentScreen="home" onNavigate={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0]).toHaveAccessibleName('Muro')
    expect(buttons[1]).toHaveAccessibleName('Inicio')
    expect(buttons[2]).toHaveAccessibleName('Perfil')
  })

  it('destaca el ítem activo según currentScreen', () => {
    const { rerender } = render(<BottomNav currentScreen="home" onNavigate={() => {}} />)
    expect(screen.getByRole('button', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Muro' })).not.toHaveAttribute('aria-current')

    rerender(<BottomNav currentScreen="feed" onNavigate={() => {}} />)
    expect(screen.getByRole('button', { name: 'Muro' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
  })

  it('llama a onNavigate con la pantalla correspondiente al hacer click', async () => {
    const onNavigate = vi.fn()
    render(<BottomNav currentScreen="home" onNavigate={onNavigate} />)

    await userEvent.click(screen.getByRole('button', { name: 'Muro' }))
    expect(onNavigate).toHaveBeenCalledWith('feed')

    await userEvent.click(screen.getByRole('button', { name: 'Perfil' }))
    expect(onNavigate).toHaveBeenCalledWith('profile')

    await userEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })
})
