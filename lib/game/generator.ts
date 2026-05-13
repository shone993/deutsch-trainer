import type { GameQuestion, GameType, GrammaticalPerson, VerbData } from '@/types'
import { parseSentenceTemplate } from './parser'

const PERSONS: GrammaticalPerson[] = ['ich', 'du', 'er', 'wir', 'ihr', 'sie']

// Vraća nasumičan element iz niza
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Mešanje niza (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getConjugation(verb: VerbData, person: GrammaticalPerson): string {
  return verb.conjugation[person]
}

// Generiše lažne odgovore (distraktori) iz ostalih glagola
function getDistractors(correct: string, allVerbs: VerbData[], count = 3): string[] {
  const pool = new Set<string>()
  for (const verb of shuffle(allVerbs)) {
    for (const person of PERSONS) {
      const form = getConjugation(verb, person)
      if (form !== correct) pool.add(form)
      if (pool.size >= count * 3) break
    }
    if (pool.size >= count * 3) break
  }
  return shuffle([...pool]).slice(0, count)
}

interface GenerateOptions {
  verbs: VerbData[]
  sentences?: Array<{ id: string; verbId: string; template: string; translation: string }>
  gameType: GameType
  lesson: number
  count: number // broj pitanja
}

export function generateQuestions(opts: GenerateOptions): GameQuestion[] {
  const { verbs, sentences = [], gameType, count } = opts
  if (verbs.length === 0) return []

  const verbMap = new Map(verbs.map((v) => [v.id, v]))
  const questions: GameQuestion[] = []

  const shuffledVerbs = shuffle(verbs)

  for (let i = 0; i < count; i++) {
    const verb = shuffledVerbs[i % shuffledVerbs.length]
    const person = randomItem(PERSONS)
    const correctAnswer = getConjugation(verb, person)

    switch (gameType) {
      case 'FILL_BLANK': {
        // Nađi rečenicu za ovaj glagol, ili napravi generičku
        const matchingSentences = sentences.filter((s) => s.verbId === verb.id)
        const sentence = randomItem(matchingSentences.length > 0 ? matchingSentences : [])

        if (sentence) {
          const parsed = parseSentenceTemplate(sentence.template, verbMap)
          const firstBlank = parsed.blanks[0]
          if (!firstBlank) break

          questions.push({
            id: `${sentence.id}-${i}`,
            type: 'FILL_BLANK',
            verbId: verb.id,
            infinitiv: verb.infinitiv,
            sentence: sentence.template,
            parsedSentence: parsed,
            translation: sentence.translation,
            correctAnswers: [firstBlank.answer],
          })
        } else {
          // Generička rečenica ako nema u bazi
          const personLabel = person === 'er' ? 'Er/Sie/Es' : person.charAt(0).toUpperCase() + person.slice(1)
          questions.push({
            id: `generic-${verb.id}-${person}-${i}`,
            type: 'FILL_BLANK',
            verbId: verb.id,
            infinitiv: verb.infinitiv,
            sentence: `${personLabel} _____ (${verb.infinitiv})`,
            translation: verb.translation ?? verb.infinitiv,
            correctAnswers: [correctAnswer],
          })
        }
        break
      }

      case 'MATCH_PAIRS': {
        // 4 para: infinitiv ↔ konjugacija za random lice
        const pairVerbs = shuffle(verbs).slice(0, 4)
        const pairPerson = randomItem(PERSONS)
        questions.push({
          id: `match-${verb.id}-${i}`,
          type: 'MATCH_PAIRS',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: pairVerbs.map((v) => getConjugation(v, pairPerson)),
          options: pairVerbs.map((v) => v.infinitiv),
        })
        break
      }

      case 'TRANSLATE': {
        const distractors = getDistractors(correctAnswer, verbs, 3)
        const options = shuffle([correctAnswer, ...distractors])
        questions.push({
          id: `trans-${verb.id}-${person}-${i}`,
          type: 'TRANSLATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: `${person} (${verb.translation ?? verb.infinitiv})`,
          correctAnswers: [correctAnswer],
          options,
        })
        break
      }

      case 'AUDIO': {
        questions.push({
          id: `audio-${verb.id}-${person}-${i}`,
          type: 'AUDIO',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [correctAnswer],
          audioWord: correctAnswer,
        })
        break
      }
    }
  }

  return questions
}
