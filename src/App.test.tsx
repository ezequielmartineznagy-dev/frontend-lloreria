import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./services/ai', () => ({
  generateDiagnosis: vi.fn().mockImplementation(async (text: string) => {
    return `Diagnóstico para: ${text}`
  }),
  generateGotitaReply: vi.fn().mockImplementation(async (text: string) => {
    return `Respuesta a: ${text}`
  }),
}))

// El diagnóstico y transición tarda 1.5s
const SLOW = { timeout: 3500 }

describe('App: navegación por gestos y paginación horizontal', () => {
  beforeEach(() => localStorage.clear())

  const sendFromHome = async (text: string) => {
    await userEvent.type(screen.getByPlaceholderText('¿Qué pasó hoy?'), `${text}{Enter}`)
  }

  it('muestra estado de carga y pasa directo a ChatView con el lloro y diagnóstico', async () => {
    render(<App />)
    await sendFromHome('Se me cortó la leche')
    expect(await screen.findByText('Analizando tu nivel de drama...')).toBeInTheDocument()

    // Llega directamente a ChatView sin pasar por el modal
    expect(await screen.findByText('La Gotita', {}, SLOW)).toBeInTheDocument()
    expect(screen.getByText('Se me cortó la leche')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('permite navegar entre Inicio, Muro y Perfil mediante el indicador de paginación (dots)', async () => {
    render(<App />)

    // En Inicio por defecto (dot central activo)
    expect(screen.getByRole('button', { name: 'Ir a Inicio' })).toHaveAttribute('aria-current', 'page')

    // Ir a Muro (izquierda)
    await userEvent.click(screen.getByRole('button', { name: 'Ir a Muro' }))
    expect(await screen.findByText('Lloros y Lloros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir a Muro' })).toHaveAttribute('aria-current', 'page')

    // Ir a Perfil (derecha)
    await userEvent.click(screen.getByRole('button', { name: 'Ir a Perfil' }))
    expect(await screen.findByText('Llorón Profesional')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir a Perfil' })).toHaveAttribute('aria-current', 'page')

    // Regresar a Inicio
    await userEvent.click(screen.getByRole('button', { name: 'Ir a Inicio' }))
    expect(await screen.findByText('Desahogate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir a Inicio' })).toHaveAttribute('aria-current', 'page')
  })

  it('no contiene BottomNav y permite volver del Chat al Home', async () => {
    render(<App />)

    // BottomNav eliminada por completo
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()

    await sendFromHome('Algo dramático')
    expect(await screen.findByText('La Gotita', {}, SLOW)).toBeInTheDocument()

    // Al tocar volver en el chat, regresa al home
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(await screen.findByText('Desahogate')).toBeInTheDocument()
  })
})
