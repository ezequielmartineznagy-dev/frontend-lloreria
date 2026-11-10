import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

// El diagnóstico y transición tarda 1.5s
const SLOW = { timeout: 3500 }

describe('App: flujo principal con Bottom Navigation', () => {
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

  it('permite navegar entre Inicio, Muro y Perfil mediante BottomNav', async () => {
    render(<App />)

    // En Inicio por defecto
    expect(screen.getByRole('button', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')

    // Ir a Muro
    await userEvent.click(screen.getByRole('button', { name: 'Muro' }))
    expect(await screen.findByText('Lloros y Lloros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Muro' })).toHaveAttribute('aria-current', 'page')

    // Ir a Perfil
    await userEvent.click(screen.getByRole('button', { name: 'Perfil' }))
    expect(await screen.findByText('Llorón Profesional')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')

    // Regresar a Inicio
    await userEvent.click(screen.getByRole('button', { name: 'Inicio' }))
    expect(await screen.findByText('Desahogate')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
  })

  it('oculta la barra de navegación en el Chat y permite volver al Home', async () => {
    render(<App />)
    await sendFromHome('Algo dramático')

    expect(await screen.findByText('La Gotita', {}, SLOW)).toBeInTheDocument()
    // En chat la barra inferior no debe estar visible
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).not.toBeInTheDocument()

    // Al tocar volver en el chat, regresa al home y la barra reaparece
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(await screen.findByText('Desahogate')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
})
