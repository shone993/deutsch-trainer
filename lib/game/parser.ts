import type { GrammaticalPerson, ParsedSentence, SentencePart, SentenceTag, VerbData } from '@/types'

// Mapa skraćenica lica na GrammaticalPerson
const PERSON_MAP: Record<string, GrammaticalPerson> = {
  ich: 'ich',
  du: 'du',
  er: 'er',
  'er/sie/es': 'er',
  wir: 'wir',
  ihr: 'ihr',
  sie: 'sie',
  'sie/Sie': 'sie',
}

// Parsira tag oblika <verbId,lice> iz rečenice
// Vraća konjugaciju iz verbMap (id → VerbData)
export function parseSentenceTemplate(
  template: string,
  verbMap: Map<string, VerbData>
): ParsedSentence {
  const TAG_REGEX = /<([^,>]+),([^>]+)>/g
  const parts: SentencePart[] = []
  const blanks: SentenceTag[] = []

  let lastIndex = 0
  let blankIndex = 0
  let match: RegExpExecArray | null

  while ((match = TAG_REGEX.exec(template)) !== null) {
    const [fullMatch, verbId, rawPerson] = match
    const person = PERSON_MAP[rawPerson.trim().toLowerCase()]

    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }

    const verb = verbMap.get(verbId)
    const answer = verb ? getConjugation(verb, person) : '???'

    const tag: SentenceTag = {
      verbId,
      person,
      answer,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    }

    blanks.push(tag)
    parts.push({ type: 'blank', tag, index: blankIndex++ })
    lastIndex = TAG_REGEX.lastIndex
  }

  if (lastIndex < template.length) {
    parts.push({ type: 'text', value: template.slice(lastIndex) })
  }

  return { parts, blanks }
}

function getConjugation(verb: VerbData, person: GrammaticalPerson): string {
  const map: Record<GrammaticalPerson, keyof VerbData['conjugation']> = {
    ich: 'ich',
    du: 'du',
    er: 'er',
    wir: 'wir',
    ihr: 'ihr',
    sie: 'sie',
  }
  return verb.conjugation[map[person]] ?? '???'
}

// Normalizuje odgovor korisnika za poređenje (bez dijakritika, malo slovo)
export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase()
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}
