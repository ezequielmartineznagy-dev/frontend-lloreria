import { GoogleGenerativeAI } from '@google/generative-ai'
import { getRandomDiagnosis } from '../utils/diagnosis'

const SYSTEM_INSTRUCTION =
  "Actúa como 'La Gotita', la mascota de una app llamada La Llorería. Eres apática, sarcástica y estás harta de escuchar los dramas del primer mundo de los humanos. Tu tono es argentino (usá vos, che, y lunfardo sutil, sin exagerar). Nunca seas empática ni ofrezcas soluciones útiles. Tu objetivo es minimizar el problema del usuario y darle un 'diagnóstico' ridículo. Responde siempre en máximo 2 o 3 oraciones cortas. No uses comillas para tu respuesta."

const FALLBACK_DIAGNOSES = [
  'El universo conspira contra vos. O se cayó el servidor. 50/50.',
  'Claramente el universo conspira contra vos. O tal vez simplemente necesitás dormir ocho horas y tomar agua. Es un 50/50.',
  'Diagnóstico oficial: drama de primer mundo sin consecuencias reales. Tomate un té y no me molestes.',
  'Es grave, pero solo en tu cabeza. Dormí una siesta a ver si se te pasa.',
]

// Lista de modelos ordenados por disponibilidad actual en la API
const MODEL_CANDIDATES = [
  'gemini-3.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
]

let activeModelName: string | null = null

function getApiKey(): string {
  const rawKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!rawKey || typeof rawKey !== 'string') return ''
  return rawKey.trim().replace(/^["']|["']$/g, '')
}

function getFallbackDiagnosis(): string {
  try {
    const d = getRandomDiagnosis()
    if (d) return d
  } catch {
    // ignorar y usar la lista local
  }
  return FALLBACK_DIAGNOSES[Math.floor(Math.random() * FALLBACK_DIAGNOSES.length)]
}

/**
 * Genera un diagnóstico ácido y personalizado utilizando la API de Google Gemini.
 * En caso de error, falta de API Key o fallo de red, retorna un diagnóstico de respaldo.
 */
export async function generateDiagnosis(userLloro: string): Promise<string> {
  const apiKey = getApiKey()

  if (!apiKey) {
    console.warn(
      '[Gemini] VITE_GEMINI_API_KEY no encontrada en import.meta.env. Verifica que tu archivo .env tenga la variable y reinicia el servidor de desarrollo (npm run dev).'
    )
    return getFallbackDiagnosis()
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const prompt = `Este es el desahogo del usuario:\n"${userLloro}"\n\nDame tu diagnóstico apático y sarcástico:`

  const modelsToTry = activeModelName
    ? [activeModelName, ...MODEL_CANDIDATES.filter((m) => m !== activeModelName)]
    : MODEL_CANDIDATES

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
    } catch (error: unknown) {
      console.warn(`[Gemini] No se pudo generar con ${modelName}, evaluando alternativas...`, error)
    }
  }

  console.error('[Gemini] Todos los modelos de Gemini fallaron. Usando diagnóstico de respaldo.')
  return getFallbackDiagnosis()
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
    console.warn(
      '[Gemini] VITE_GEMINI_API_KEY no encontrada en import.meta.env. Verifica tu archivo .env y reinicia el servidor Vite.'
    )
    return 'Mirá, se me cortó la conexión. Pero seguro tu problema sigue siendo irrelevante.'
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
    } catch (error: unknown) {
      console.warn(`[Gemini] Falló respuesta de chat con ${modelName}:`, error)
    }
  }

  return 'Seguí hablando que casi me importa. De hecho, no.'
}
