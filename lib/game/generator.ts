import type { GameQuestion, GameType, GrammaticalPerson, ParsedSentence, SentenceTag, VerbData } from '@/types'
import { parseSentenceTemplate } from './parser'

const PERSONS: GrammaticalPerson[] = ['ich', 'du', 'er', 'wir', 'ihr', 'sie']

const PRETERIT_DATA: Record<string, Record<GrammaticalPerson, string>> = {
  'können': { ich: 'konnte',  du: 'konntest', er: 'konnte',  wir: 'konnten', ihr: 'konntet', sie: 'konnten' },
  'müssen': { ich: 'musste',  du: 'musstest', er: 'musste',  wir: 'mussten', ihr: 'musstet', sie: 'mussten' },
  'wollen': { ich: 'wollte',  du: 'wolltest', er: 'wollte',  wir: 'wollten', ihr: 'wolltet', sie: 'wollten' },
  'sollen': { ich: 'sollte',  du: 'solltest', er: 'sollte',  wir: 'sollten', ihr: 'solltet', sie: 'sollten' },
  'dürfen': { ich: 'durfte',  du: 'durftest', er: 'durfte',  wir: 'durften', ihr: 'durftet', sie: 'durften' },
  'mögen':  { ich: 'mochte',  du: 'mochtest', er: 'mochte',  wir: 'mochten', ihr: 'mochtet', sie: 'mochten' },
  'sein':   { ich: 'war',     du: 'warst',    er: 'war',     wir: 'waren',   ihr: 'wart',    sie: 'waren'   },
  'haben':  { ich: 'hatte',   du: 'hattest',  er: 'hatte',   wir: 'hatten',  ihr: 'hattet',  sie: 'hatten'  },
}

interface PreteritSentence { template: string; person: GrammaticalPerson; translation: string }

const PRETERIT_SENTENCES: Record<string, PreteritSentence[]> = {
  'können': [
    { template: 'Ich _____ gestern nicht kommen.',       person: 'ich', translation: 'Juče nisam mogao/la da dođem.' },
    { template: 'Er _____ sehr gut schwimmen.',          person: 'er',  translation: 'On je mogao dobro da pliva.' },
    { template: 'Wir _____ die Aufgabe lösen.',          person: 'wir', translation: 'Mogli smo da rešimo zadatak.' },
    { template: 'Ihr _____ nicht schlafen.',             person: 'ihr', translation: 'Niste mogli da spavate.' },
  ],
  'müssen': [
    { template: 'Ich _____ früh aufstehen.',             person: 'ich', translation: 'Morao/la sam rano da ustanem.' },
    { template: 'Er _____ lange warten.',                person: 'er',  translation: 'Morao je dugo da čeka.' },
    { template: 'Wir _____ viel lernen.',                person: 'wir', translation: 'Morali smo mnogo da učimo.' },
    { template: 'Du _____ das Zimmer aufräumen.',        person: 'du',  translation: 'Morao/la si da počistiš sobu.' },
  ],
  'wollen': [
    { template: 'Er _____ Arzt werden.',                 person: 'er',  translation: 'Hteo je da postane lekar.' },
    { template: 'Ich _____ ins Kino gehen.',             person: 'ich', translation: 'Hteo/la sam u bioskop.' },
    { template: 'Sie _____ nicht kommen.',               person: 'er',  translation: 'Ona nije htela da dođe.' },
    { template: 'Wir _____ zusammen essen.',             person: 'wir', translation: 'Hteli smo zajedno da jedemo.' },
  ],
  'sollen': [
    { template: 'Ich _____ das Buch lesen.',             person: 'ich', translation: 'Trebalo je da pročitam knjigu.' },
    { template: 'Er _____ die Tür schließen.',           person: 'er',  translation: 'Trebalo je da zatvori vrata.' },
    { template: 'Wir _____ pünktlich sein.',             person: 'wir', translation: 'Trebalo je da budemo tačni.' },
    { template: 'Du _____ früher kommen.',               person: 'du',  translation: 'Trebalo je da dođeš ranije.' },
  ],
  'dürfen': [
    { template: 'Wir _____ nicht laut sprechen.',        person: 'wir', translation: 'Nismo smeli glasno da govorimo.' },
    { template: 'Er _____ nicht spielen.',               person: 'er',  translation: 'On nije smeo da se igra.' },
    { template: 'Ich _____ ins Kino gehen.',             person: 'ich', translation: 'Smeo/la sam u bioskop.' },
    { template: 'Du _____ das nicht sagen.',             person: 'du',  translation: 'Nisi smeo/la to da kažeš.' },
  ],
  'mögen': [
    { template: 'Er _____ keine Tomaten.',               person: 'er',  translation: 'On nije voleo paradajz.' },
    { template: 'Ich _____ diesen Film sehr.',           person: 'ich', translation: 'Veoma sam voleo/la ovaj film.' },
    { template: 'Sie _____ klassische Musik.',           person: 'er',  translation: 'Ona je volela klasičnu muziku.' },
    { template: 'Wir _____ dieses Restaurant.',          person: 'wir', translation: 'Voleli smo ovaj restoran.' },
  ],
  'sein': [
    { template: 'Ich _____ gestern krank.',              person: 'ich', translation: 'Juče sam bio/la bolestan/na.' },
    { template: 'Er _____ sehr glücklich.',              person: 'er',  translation: 'On je bio veoma srećan.' },
    { template: 'Wir _____ in Berlin.',                  person: 'wir', translation: 'Bili smo u Berlinu.' },
    { template: 'Ihr _____ sehr müde.',                  person: 'ihr', translation: 'Bili ste veoma umorni.' },
    { template: 'Du _____ pünktlich.',                   person: 'du',  translation: 'Bio/la si tačan/na.' },
    { template: 'Sie _____ gute Freunde.',               person: 'sie', translation: 'Bili su dobri prijatelji.' },
  ],
  'haben': [
    { template: 'Ich _____ keine Zeit.',                 person: 'ich', translation: 'Nisam imao/la vremena.' },
    { template: 'Er _____ großen Hunger.',               person: 'er',  translation: 'Bio je veoma gladan.' },
    { template: 'Wir _____ viel Spaß.',                  person: 'wir', translation: 'Imali smo puno zabave.' },
    { template: 'Du _____ Recht.',                       person: 'du',  translation: 'Imao/la si pravo.' },
    { template: 'Sie _____ einen Hund.',                 person: 'sie', translation: 'Imali su psa.' },
    { template: 'Ihr _____ Glück.',                      person: 'ihr', translation: 'Imali ste sreće.' },
  ],
}

const HABEN_CONJ: Record<GrammaticalPerson, string> = {
  ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben',
}
const SEIN_CONJ: Record<GrammaticalPerson, string> = {
  ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind',
}

function getPerfektForm(verb: VerbData, person: GrammaticalPerson): string {
  const aux = verb.hilfsverb === 'SEIN' ? SEIN_CONJ[person] : HABEN_CONJ[person]
  return `${aux} ${verb.perfekt}`
}

const PERSON_PRONOUN: Record<GrammaticalPerson, string> = {
  ich: 'ich',
  du: 'du',
  er: 'er/sie/es',
  wir: 'wir',
  ihr: 'ihr',
  sie: 'sie/Sie',
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

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

/** Rastavlja rečenicu na tokene — reči + interpunkcija kao zasebni tokeni */
function tokenizeSentence(sentence: string): string[] {
  const tokens: string[] = []
  sentence.trim().split(/\s+/).forEach(word => {
    const match = word.match(/^(.*?)([.,!?;:]+)$/)
    if (match && match[1]) {
      tokens.push(match[1])
      tokens.push(match[2])
    } else {
      tokens.push(word)
    }
  })
  return tokens.filter(t => t.length > 0)
}

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
  count: number
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

      case 'CONJUGATE': {
        // Prosta konjugacija: prikazuje se zamenica + praznina, upisuje se oblik
        questions.push({
          id: `conj-${verb.id}-${person}-${i}`,
          type: 'CONJUGATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: `${PERSON_PRONOUN[person]} + ${verb.infinitiv}`,
          correctAnswers: [correctAnswer],
          options: [PERSON_PRONOUN[person]], // options[0] = zamenica koja se prikazuje
        })
        break
      }

      case 'FILL_BLANK': {
        // Samo rečenice sa prazninom — bez generičkog fallbacka
        const matchingSentences = sentences.filter((s) => s.verbId === verb.id)
        if (matchingSentences.length === 0) break

        const sentence = randomItem(matchingSentences)
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
        break
      }

      case 'MATCH_PAIRS': {
        // 4 para: infinitiv ↔ zamenica + konjugacija (npr. "sein" ↔ "er/sie/es ist")
        const pairVerbs = shuffle(verbs).slice(0, 4)
        const pairPerson = randomItem(PERSONS)
        const pronoun = PERSON_PRONOUN[pairPerson]
        questions.push({
          id: `match-${verb.id}-${i}`,
          type: 'MATCH_PAIRS',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: pairVerbs.map((v) => `${pronoun} ${getConjugation(v, pairPerson)}`),
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
          translation: `${PERSON_PRONOUN[person]} (${verb.translation ?? verb.infinitiv})`,
          correctAnswers: [correctAnswer],
          options,
        })
        break
      }

      case 'PERFEKT_HILFSVERB': {
        // Samo HABEN ili SEIN — višestruki izbor od 2
        const isHaben = verb.hilfsverb === 'HABEN'
        questions.push({
          id: `ph-${verb.id}-${i}`,
          type: 'PERFEKT_HILFSVERB',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [verb.hilfsverb === 'HABEN' ? 'haben' : 'sein'],
          options: isHaben ? ['haben', 'sein'] : ['sein', 'haben'],
        })
        break
      }

      case 'PERFEKT_PARTIZIP': {
        // Dat infinitiv → upiši Partizip II
        const distractorsP = shuffle(verbs)
          .filter((v) => v.id !== verb.id && v.perfekt)
          .slice(0, 3)
          .map((v) => v.perfekt)
        questions.push({
          id: `pp-${verb.id}-${i}`,
          type: 'PERFEKT_PARTIZIP',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [verb.perfekt],
          options: shuffle([verb.perfekt, ...distractorsP]),
        })
        break
      }

      case 'PERFEKT_CONJUGATE': {
        // Sa licem: ich + gehen → bin gegangen
        const perfektAnswer = getPerfektForm(verb, person)
        questions.push({
          id: `pc-${verb.id}-${person}-${i}`,
          type: 'PERFEKT_CONJUGATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [perfektAnswer],
          options: [PERSON_PRONOUN[person]],
        })
        break
      }

      case 'PERFEKT_FILL': {
        // Rečenica sa dva prazna mesta: aux + partizip
        const matchingSentences = sentences.filter((s) => s.verbId === verb.id)
        if (matchingSentences.length === 0) break
        const sentence = randomItem(matchingSentences)
        const parsed = parseSentenceTemplate(sentence.template, verbMap)
        if (parsed.blanks.length < 2) break
        questions.push({
          id: `pf-${sentence.id}-${i}`,
          type: 'PERFEKT_FILL',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          sentence: sentence.template,
          parsedSentence: parsed,
          translation: sentence.translation,
          correctAnswers: parsed.blanks.map((b) => b.answer),
        })
        break
      }

      case 'PERFEKT_PARTIZIP_MATCH': {
        // Poveži infinitiv (levo) ↔ Partizip II (desno)
        const pairVerbs = shuffle(verbs).slice(0, 4)
        questions.push({
          id: `perf-pmatch-${verb.id}-${i}`,
          type: 'PERFEKT_PARTIZIP_MATCH',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: pairVerbs.map((v) => v.perfekt),
          options: pairVerbs.map((v) => v.infinitiv),
        })
        break
      }

      case 'PRETERIT_MATCH': {
        const eligibleVerbs = verbs.filter((v) => v.infinitiv in PRETERIT_DATA)
        if (eligibleVerbs.length < 4) break
        const pairVerbs = shuffle(eligibleVerbs).slice(0, 4)
        const pairPerson = randomItem(PERSONS)
        const pronoun = PERSON_PRONOUN[pairPerson]
        questions.push({
          id: `pret-match-${verb.id}-${i}`,
          type: 'PRETERIT_MATCH',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: pairVerbs.map((v) => `${pronoun} ${PRETERIT_DATA[v.infinitiv]![pairPerson]}`),
          options: pairVerbs.map((v) => v.infinitiv),
        })
        break
      }

      case 'PRETERIT_CONJUGATE': {
        const preteritConj = PRETERIT_DATA[verb.infinitiv]
        if (!preteritConj) break
        questions.push({
          id: `pret-conj-${verb.id}-${person}-${i}`,
          type: 'PRETERIT_CONJUGATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: `${PERSON_PRONOUN[person]} + ${verb.infinitiv}`,
          correctAnswers: [preteritConj[person]],
          options: [PERSON_PRONOUN[person]],
        })
        break
      }

      case 'PRETERIT_FILL': {
        const sentencePool = PRETERIT_SENTENCES[verb.infinitiv]
        if (!sentencePool || sentencePool.length === 0) break
        const sentenceData = randomItem(sentencePool)
        const correct = PRETERIT_DATA[verb.infinitiv]?.[sentenceData.person]
        if (!correct) break
        const placeholder = '_____'
        const blankIndex = sentenceData.template.indexOf(placeholder)
        if (blankIndex === -1) break
        const before = sentenceData.template.slice(0, blankIndex)
        const after = sentenceData.template.slice(blankIndex + placeholder.length)
        const fakeTag: SentenceTag = {
          verbId: verb.id,
          person: sentenceData.person,
          answer: correct,
          startIndex: blankIndex,
          endIndex: blankIndex + placeholder.length,
        }
        const parsedSentence: ParsedSentence = {
          parts: [
            ...(before ? [{ type: 'text' as const, value: before }] : []),
            { type: 'blank' as const, tag: fakeTag, index: 0 },
            ...(after ? [{ type: 'text' as const, value: after }] : []),
          ],
          blanks: [fakeTag],
        }
        questions.push({
          id: `pret-fill-${verb.id}-${i}`,
          type: 'PRETERIT_FILL',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          sentence: sentenceData.template,
          parsedSentence,
          translation: sentenceData.translation,
          correctAnswers: [correct],
        })
        break
      }

      case 'WORD_ORDER': {
        const pool = sentences.filter(s => s.verbId === verb.id)
        if (pool.length === 0) break
        const sent = randomItem(pool)
        const tokens = tokenizeSentence(sent.template)
        if (tokens.length < 3) break
        questions.push({
          id: `wo-${verb.id}-${i}`,
          type: 'WORD_ORDER',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          sentence: sent.template,
          translation: sent.translation || '',
          correctAnswers: [sent.template],
          options: shuffle(tokens),   // izmešani tokeni
        })
        break
      }

      case 'AUDIO': {
        // Čuje se konjugovani oblik → odaberi tačan infinitiv
        const distractors = shuffle(verbs.filter((v) => v.id !== verb.id)).slice(0, 3)
        const allFour = shuffle([verb, ...distractors])
        const pronoun = PERSON_PRONOUN[person]
        const form = getConjugation(verb, person)
        questions.push({
          id: `audio-${verb.id}-${person}-${i}`,
          type: 'AUDIO',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          audioWord: `${pronoun} ${form}`,          // šta se govori
          translation: `${pronoun} · Präsens`,       // hint na ekranu
          correctAnswers: [verb.infinitiv],           // student bira infinitiv
          options: allFour.map((v) => v.infinitiv),  // 4 dugmeta
        })
        break
      }
    }
  }

  return questions
}
