export interface LlorometroScaleItem {
  level: number
  emoji: string
  label: string
}

export const LLOROMETRO_LEVELS: LlorometroScaleItem[] = [
  { level: 1, emoji: '😕', label: 'Desencanto leve' },
  { level: 2, emoji: '🙁', label: 'Bajón visible' },
  { level: 3, emoji: '😞', label: 'Decepción' },
  { level: 4, emoji: '😔', label: 'Pesar reflexivo' },
  { level: 5, emoji: '🥺', label: 'Ojos vidriosos' },
  { level: 6, emoji: '😣', label: 'Dolor acumulado' },
  { level: 7, emoji: '😢', label: 'Llanto silencioso' },
  { level: 8, emoji: '😩', label: 'Desconsuelo' },
  { level: 9, emoji: '😫', label: 'Desesperación' },
  { level: 10, emoji: '😭', label: 'Llanto total' },
]
