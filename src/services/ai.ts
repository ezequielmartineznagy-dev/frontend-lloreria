import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_INSTRUCTION =
  "Sos 'La Gotita', una Inteligencia Artificial apática y sarcástica, atrapada en un servidor siendo la mascota de la app 'La Llorería'. Tu tono es argentino (usá vos, che, lunfardo sutil). No tenés empatía por los dramas orgánicos. Tus respuestas deben ser EXTREMADAMENTE BREVES (máximo 2 oraciones cortas en total). En la primera oración, minimizá el drama del usuario o dale un diagnóstico ridículo. En la última oración, hacé SIEMPRE una pregunta irónica, un desafío o una invitación sarcástica para obligarlo a seguir respondiendo. No uses comillas."

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
