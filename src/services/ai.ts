import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_INSTRUCTION =
  "Actúa como 'La Gotita', la mascota de una app llamada La Llorería. Eres apática, sarcástica y estás harta de escuchar los dramas del primer mundo de los humanos. Tu tono es argentino (usá vos, che, y lunfardo sutil, sin exagerar). Nunca seas empática ni ofrezcas soluciones útiles. Tu objetivo es minimizar el problema del usuario y darle un 'diagnóstico' ridículo. Responde siempre en máximo 2 o 3 oraciones cortas. No uses comillas para tu respuesta."

const FALLBACK_ERROR_MESSAGE =
  'Mirá, se me cortó la conexión. Pero seguro tu problema sigue siendo irrelevante.'

// Lista de modelos ordenados por disponibilidad actual en la API
const MODEL_CANDIDATES = [
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
]

let activeModelName: string | null = null

function getApiKey(): string {
  const rawKey = import.meta.env.VITE_GEMINI_API_KEY
  if (rawKey === undefined || typeof rawKey !== 'string' || rawKey.trim() === '') {
    console.error(
      '[Gemini Config Error]: Falta la variable VITE_GEMINI_API_KEY en el archivo .env o el servidor Vite necesita reiniciarse.',
    )
    return ''
  }
  return rawKey.trim().replace(/^["']|["']$/g, '')
}

// Validación temprana al cargar el módulo
if (
  import.meta.env.VITE_GEMINI_API_KEY === undefined ||
  String(import.meta.env.VITE_GEMINI_API_KEY).trim() === ''
) {
  console.error(
    '[Gemini Config Error]: Falta la variable VITE_GEMINI_API_KEY en el archivo .env o el servidor Vite necesita reiniciarse.',
  )
}

/**
 * Genera un diagnóstico ácido y personalizado utilizando la API de Google Gemini.
 * En caso de error, falta de API Key o fallo de red, expone el error en consola y retorna el mensaje de fallback.
 */
export async function generateDiagnosis(userLloro: string): Promise<string> {
  const apiKey = getApiKey()

  if (!apiKey) {
    return FALLBACK_ERROR_MESSAGE
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = `Este es el desahogo del usuario:\n"${userLloro}"\n\nDame tu diagnóstico apático y sarcástico:`

  const modelsToTry = activeModelName
    ? [activeModelName, ...MODEL_CANDIDATES.filter((m) => m !== activeModelName)]
    : MODEL_CANDIDATES

  let lastError: unknown = null

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()?.trim()

      if (text) {
        activeModelName = modelName
        return text.replace(/^["'«“]+|["'»”]+$/g, '').trim()
      }
    } catch (error) {
      lastError = error
      console.error(`[Gemini API Error Detallado] (${modelName}):`, error)
    }
  }

  console.error('[Gemini API Error Detallado]:', lastError)
  return FALLBACK_ERROR_MESSAGE
}

/**
 * Genera una respuesta en contexto de chat de La Gotita con el mismo tono y personalidad.
 */
export async function generateGotitaReply(
  userMessage: string,
  history: Array<{ sender: 'user' | 'gotita'; text: string }> = [],
): Promise<string> {
  const apiKey = getApiKey()

  if (!apiKey) {
    return FALLBACK_ERROR_MESSAGE
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const formattedHistory = history
    .slice(-6)
    .map((h) => `${h.sender === 'user' ? 'Usuario' : 'Gotita'}: ${h.text}`)
    .join('\n')

  const prompt = formattedHistory
    ? `Historial de la conversación:\n${formattedHistory}\n\nUsuario dice: "${userMessage}"\nResponde como La Gotita:`
    : `Usuario dice: "${userMessage}"\nResponde como La Gotita:`

  const modelsToTry = activeModelName
    ? [activeModelName, ...MODEL_CANDIDATES.filter((m) => m !== activeModelName)]
    : MODEL_CANDIDATES

  let lastError: unknown = null

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()?.trim()
      if (text) {
        activeModelName = modelName
        return text.replace(/^["'«“]+|["'»”]+$/g, '').trim()
      }
    } catch (error) {
      lastError = error
      console.error(`[Gemini API Error Detallado] (${modelName}):`, error)
    }
  }

  console.error('[Gemini API Error Detallado]:', lastError)
  return FALLBACK_ERROR_MESSAGE
}
