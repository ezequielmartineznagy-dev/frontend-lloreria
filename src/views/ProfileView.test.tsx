import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileView } from './ProfileView'

const setup = (isAlarmEnabled = true) => {
  const props = {
    onBack: vi.fn(),
    username: 'Llorón Profesional',
    stats: { volumen: '3.8 L', dramaPromedio: '7.2', rachaActiva: '14 días' },
    onSaveUsername: vi.fn(),
    onThemeChange: vi.fn(),
    currentTheme: 'oscuro' as const,
    alarmTime: '20:00 hs',
    isAlarmEnabled,
    onToggleAlarm: vi.fn(),
    onClearHistory: vi.fn(),
  }
  render(<ProfileView {...props} />)
  return props
}

describe('ProfileView', () => {
  it('muestra usuario y estadísticas', () => {
    setup()
    expect(screen.getByText('Llorón Profesional')).toBeInTheDocument()
    expect(screen.getByText('3.8 L')).toBeInTheDocument()
    expect(screen.getByText('14 días')).toBeInTheDocument()
  })

  it('marca el tema actual y permite cambiarlo', async () => {
    const props = setup()
    expect(screen.getByRole('radio', { name: 'Oscuro' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'Claro' }))
    expect(props.onThemeChange).toHaveBeenCalledWith('claro')
  })

  it('alterna la alarma', async () => {
    const props = setup(true)
    const sw = screen.getByRole('switch', { name: 'Alarma de desahogo' })
    expect(sw).toBeChecked()
    await userEvent.click(sw)
    expect(props.onToggleAlarm).toHaveBeenCalledWith(false)
  })

  it('edita el nombre desde el modal', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    const input = await screen.findByLabelText('Nombre de usuario')
    await userEvent.clear(input)
    await userEvent.type(input, 'Gotita Triste')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(props.onSaveUsername).toHaveBeenCalledWith('Gotita Triste')
  })

  it('dispara volver y borrar historial', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))
    await userEvent.click(screen.getByRole('button', { name: 'Borrar todo mi historial de penas' }))
    expect(props.onBack).toHaveBeenCalledTimes(1)
    expect(props.onClearHistory).toHaveBeenCalledTimes(1)
  })
})

