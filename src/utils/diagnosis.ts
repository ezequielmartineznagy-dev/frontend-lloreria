const DIAGNOSES = [
  'Claramente el universo conspira contra vos. O tal vez simplemente necesitás dormir ocho horas y tomar agua. Es un 50/50.',
  'Tu pena es válida, pero probablemente también tengas hambre. Comé algo y volvé a evaluar.',
  'Según nuestros cálculos, el 80% de esto se arregla con una siesta y el otro 20% con ignorar el celular.',
  'Diagnóstico oficial: drama de primer mundo con picos de dramatismo. Pronóstico reservado, pero con buen humor.',
  'Es grave, pero no tanto como lo vas a sentir a las tres de la mañana. Dormí y lo hablamos mañana.',
  'La tragedia es real. También lo son los mates, los abrazos y las pizzas. Elegí tu tratamiento.',
]

/** Devuelve un diagnóstico sarcástico al azar. TODO: reemplazar por el del backend. */
export function getRandomDiagnosis(): string {
  return DIAGNOSES[Math.floor(Math.random() * DIAGNOSES.length)]
}

