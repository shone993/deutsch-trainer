const CORRECT_PHRASES = [
  'Sehr gut!',
  'Richtig!',
  'Gut gemacht!',
  'Das stimmt.',
  'Genau!',
  'Ausgezeichnet!',
  'Prima!',
  'Korrekt.',
  'Das haben Sie richtig gelöst.',
  'Weiter so!',
]

const WRONG_PHRASES = [
  'Versuchen Sie es noch einmal.',
  'Nicht ganz richtig. Ein weiterer Versuch hilft.',
]

export function randomCorrectPhrase(): string {
  return CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)]
}

export function randomWrongPhrase(): string {
  return WRONG_PHRASES[Math.floor(Math.random() * WRONG_PHRASES.length)]
}
