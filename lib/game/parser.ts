import type { GrammaticalPerson, ParsedSentence, SentencePart, SentenceTag, VerbData } from '@/types'

const PERSON_MAP: Record<string, GrammaticalPerson> = {
  ich: 'ich', du: 'du', er: 'er', 'er/sie/es': 'er',
  wir: 'wir', ihr: 'ihr', sie: 'sie', 'sie/Sie': 'sie',
}

const HABEN_CONJ: Record<string, string> = {
  ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben',
}
const SEIN_CONJ: Record<string, string> = {
  ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind',
}

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
    const [fullMatch, verbId, rawTag] = match

    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }

    const verb = verbMap.get(verbId)
    let answer = '???'
    let person: GrammaticalPerson = 'er'

    if (rawTag === 'partizip') {
      // Perfekt: Partizip II
      answer = verb?.perfekt ?? '???'
      person = 'er' // placeholder
    } else if (rawTag.startsWith('aux_')) {
      // Perfekt: konjugovani pomoćni glagol, npr. aux_ich
      const auxPerson = rawTag.slice(4) as GrammaticalPerson
      person = auxPerson
      if (verb) {
        const conj = verb.hilfsverb === 'SEIN' ? SEIN_CONJ : HABEN_CONJ
        answer = conj[auxPerson] ?? '???'
      }
    } else {
      // Präsens: standardno lice
      person = PERSON_MAP[rawTag.trim().toLowerCase()] ?? 'er'
      if (verb) answer = getConjugation(verb, person)
    }

    const tag: SentenceTag = {
      verbId, person, answer,
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
    ich: 'ich', du: 'du', er: 'er', wir: 'wir', ihr: 'ihr', sie: 'sie',
  }
  return verb.conjugation[map[person]] ?? '???'
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase()
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}
