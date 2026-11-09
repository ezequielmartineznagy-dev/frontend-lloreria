import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { getStoredDrops } from './services/lloros'

// El diagnóstico tarda 1.5–2 s simulando la red
const SLOW = { timeout: 3500 }

describe('App: flujo principal', () => {
  beforeEach(() => localStorage.clear())

  const sendFromHome = async (text: string) => {
    await userEvent.type(screen.getByPlaceholderText('¿Qué pasó hoy?'), `${text}{Enter}`)
  }

  it('muestra el estado de carga antes del diagnóstico', async () => {
    render(<App />)
    await sendFromHome('algo')
    expect(await screen.findByText('Analizando tu nivel de drama...')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('dialog', {}, SLOW)).toBeInTheDocument()
  })

  it('enviar texto abre el diagnóstico y "Aceptar mi destino" lleva al chat', async () => {
    render(<App />)
    await sendFromHome('Se me cortó la leche')
    expect(await screen.findByRole('dialog', {}, SLOW)).toHaveAccessibleName('Diagnóstico')

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar mi destino' }))
    expect(await screen.findByText('La Gotita')).toBeInTheDocument()
    expect(screen.getByText('Se me cortó la leche')).toBeInTheDocument()
  })

  it('"Compartir drama" abre el Llorómetro y soltar guarda el lloro', async () => {
    render(<App />)
    await sendFromHome('Se me perdió el cargador')
    await userEvent.click(await screen.findByRole('button', { name: 'Compartir drama' }, SLOW))

    expect(await screen.findByText('Lloros y Lloros')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Soltar a la lluvia' }))

    const stored = getStoredDrops()
    expect(stored[0].text).toBe('Se me perdió el cargador')
    expect(stored[0].level).toBe(5)
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Soltar a la lluvia' })).not.toBeInTheDocument(),
    )
  })

  it('la flecha del Muro vuelve al Home', async () => {
    render(<App />)
    await sendFromHome('algo')
    await userEvent.click(await screen.findByRole('button', { name: 'Compartir drama' }, SLOW))
    await userEvent.click(await screen.findByRole('button', { name: 'Volver' }))
    expect(await screen.findByText('Desahogate')).toBeInTheDocument()
  })
})


