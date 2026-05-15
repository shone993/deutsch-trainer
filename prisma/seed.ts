import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import { VERBS_FROM_EXCEL } from './verbs-data'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

const PERSON_LABELS: Record<string, string> = {
  ich: 'ich', du: 'du', erSieEs: 'er', wir: 'wir', ihr: 'ihr', sieSie: 'sie',
}

const SUBJECT_TO_PERSON: Record<string, string> = {
  'ich': 'ich', 'du': 'du', 'er': 'erSieEs', 'sie': 'erSieEs', 'es': 'erSieEs',
  'wir': 'wir', 'ihr': 'ihr', 'Sie': 'sieSie',
}

function sentenceToTemplate(
  sentence: string,
  verbId: string,
  conjugations: Record<string, string>
): { template: string; person: string } | null {
  // Napravi mapu: forma -> osoba (za pronalaženje oblika u rečenici)
  const formToPersons: Record<string, string[]> = {}
  for (const [person, form] of Object.entries(conjugations)) {
    if (!form) continue
    if (!formToPersons[form]) formToPersons[form] = []
    formToPersons[form].push(person)
  }

  const words = sentence.split(/\b/)

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const persons = formToPersons[word]
    if (!persons) continue

    let chosenPerson = persons[0]

    // Ako ima više lica za isti oblik, pokušaj da odrediš iz subjekta rečenice
    if (persons.length > 1) {
      const before = words.slice(0, i).join('')
      const firstWord = before.trim().split(/\s+/).find(w => w.length > 0)
      if (firstWord && SUBJECT_TO_PERSON[firstWord]) {
        const p = SUBJECT_TO_PERSON[firstWord]
        if (persons.includes(p)) chosenPerson = p
      }
    }

    const template = words.map((w, j) => j === i ? `<${verbId},${chosenPerson}>` : w).join('')
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
      erSieEs: v.erSieEs,
      wir: v.wir,
      ihr: v.ihr,
      sieSie: v.sieSie,
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
