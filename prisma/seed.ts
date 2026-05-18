import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import { VERBS_FROM_EXCEL } from './verbs-data'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

const SUBJECT_TO_PERSON: Record<string, string> = {
  'ich': 'ich', 'Ich': 'ich',
  'du': 'du', 'Du': 'du',
  'er': 'er', 'Er': 'er', 'sie': 'er', 'Sie': 'sie', 'es': 'er', 'Es': 'er',
  'wir': 'wir', 'Wir': 'wir',
  'ihr': 'ihr', 'Ihr': 'ihr',
}

// Izvuče čistu reč bez interpunkcije
function stripPunct(w: string): string {
  return w.replace(/[.,!?;:"""„\-()]+/g, '').trim()
}

function sentenceToTemplate(
  sentence: string,
  verbId: string,
  conjugations: Record<string, string>
): { template: string; person: string } | null {
  // Mapa: oblik -> lista lica
  const formToPersons: Record<string, string[]> = {}
  for (const [person, form] of Object.entries(conjugations)) {
    if (!form) continue
    // Razdvojivi glagoli (npr. "lädt ein") — uzimamo samo prvi deo za matching
    const key = form.includes(' ') ? form.split(' ')[0] : form
    if (!formToPersons[key]) formToPersons[key] = []
    formToPersons[key].push(person)
  }

  // Tokenizuj rečenicu čuvajući pozicije
  const tokens = sentence.split(/(\s+)/)

  for (let i = 0; i < tokens.length; i++) {
    const clean = stripPunct(tokens[i])
    const persons = formToPersons[clean]
    if (!persons) continue

    let chosenPerson = persons[0]

    // Pokušaj da odrediš lice iz subjekta (prethodna reč)
    if (persons.length > 1) {
      const prevWords = tokens.slice(0, i).map(stripPunct).filter(Boolean)
      const lastWord = prevWords[prevWords.length - 1] ?? ''
      const p = SUBJECT_TO_PERSON[lastWord]
      if (p && persons.includes(p)) chosenPerson = p
    }

    // Zameni token u rečenici templateom — čuvaj interpunkciju oko reči
    const punct = tokens[i].replace(clean, '')
    const replacement = `<${verbId},${chosenPerson}>${punct}`
    const template = tokens.map((t, j) => j === i ? replacement : t).join('')
    return { template, person: chosenPerson }
  }

  return null
}

async function main() {
  console.log('🌱 Seeding database...')

  // Admin nalog
  await prisma.user.upsert({
    where: { email: 'admin@vtss.edu.rs' },
    create: {
      email: 'admin@vtss.edu.rs',
      name: 'Admin',
      surname: 'VTŠ',
      displayName: 'admin',
      role: 'ADMIN',
      isVerified: true,
    },
    update: {},
  })

  let verbCount = 0
  let sentenceCount = 0

  for (const v of VERBS_FROM_EXCEL) {
    // Preskoči glagole bez konjugacije
    if (!v.ich && !v.du && !v.erSieEs) {
      console.log(`  ⚠️  Preskočen (bez konjugacije): ${v.infinitiv}`)
      continue
    }

    const conjugations: Record<string, string> = {
      ich: v.ich,
      du: v.du,
      er: v.erSieEs,
      wir: v.wir,
      ihr: v.ihr,
      sie: v.sieSie,
    }

    const created = await prisma.verb.upsert({
      where: { infinitiv: v.infinitiv },
      create: {
        infinitiv: v.infinitiv,
        ich: v.ich,
        du: v.du,
        erSieEs: v.erSieEs,
        wir: v.wir,
        ihr: v.ihr,
        sieSie: v.sieSie,
        perfekt: v.perfekt || v.infinitiv,
        hilfsverb: v.hilfsverb === 'SEIN' ? 'SEIN' : 'HABEN',
        lesson: v.lesson,
        difficulty: v.difficulty,
      },
      update: {
        ich: v.ich,
        du: v.du,
        erSieEs: v.erSieEs,
        wir: v.wir,
        ihr: v.ihr,
        sieSie: v.sieSie,
        perfekt: v.perfekt || v.infinitiv,
        hilfsverb: v.hilfsverb === 'SEIN' ? 'SEIN' : 'HABEN',
        lesson: v.lesson,
      },
    })

    verbCount++

    // Dodaj rečenice kao FILL_BLANK template
    for (let i = 0; i < v.sentences.length; i++) {
      const sentence = v.sentences[i]
      const result = sentenceToTemplate(sentence, created.id, conjugations)
      if (!result) continue

      const sentenceId = `excel-${created.id}-${i}`
      await prisma.sentence.upsert({
        where: { id: sentenceId },
        create: {
          id: sentenceId,
          verbId: created.id,
          template: result.template,
          translation: sentence,
          difficulty: 1,
        },
        update: {
          template: result.template,
          translation: sentence,
        },
      })
      sentenceCount++
    }

    console.log(`  ✅ [L${v.lesson}] ${v.infinitiv} (${v.sentences.length} rečenica)`)
  }

  console.log(`\n✅ Seed završen: ${verbCount} glagola, ${sentenceCount} rečenica`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
