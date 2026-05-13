import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

// Glagoli iz VTŠ udžbenika — Lekcija 1 (sein, haben, lernen, heißen, kommen, wohnen)
const VERBS_LEKTION_1 = [
  {
    infinitiv: 'sein',
    ich: 'bin', du: 'bist', erSieEs: 'ist', wir: 'sind', ihr: 'seid', sieSie: 'sind',
    perfekt: 'gewesen', hilfsverb: 'SEIN' as const,
    lesson: 1, difficulty: 1,
    translation: 'biti', translationEn: 'to be', translationHu: 'lenni',
  },
  {
    infinitiv: 'haben',
    ich: 'habe', du: 'hast', erSieEs: 'hat', wir: 'haben', ihr: 'habt', sieSie: 'haben',
    perfekt: 'gehabt', hilfsverb: 'HABEN' as const,
    lesson: 1, difficulty: 1,
    translation: 'imati', translationEn: 'to have', translationHu: 'bírni/rendelkezni',
  },
  {
    infinitiv: 'lernen',
    ich: 'lerne', du: 'lernst', erSieEs: 'lernt', wir: 'lernen', ihr: 'lernt', sieSie: 'lernen',
    perfekt: 'gelernt', hilfsverb: 'HABEN' as const,
    lesson: 1, difficulty: 1,
    translation: 'učiti', translationEn: 'to learn', translationHu: 'tanulni',
  },
  {
    infinitiv: 'heißen',
    ich: 'heiße', du: 'heißt', erSieEs: 'heißt', wir: 'heißen', ihr: 'heißt', sieSie: 'heißen',
    perfekt: 'geheißen', hilfsverb: 'HABEN' as const,
    lesson: 1, difficulty: 1,
    translation: 'zvati se', translationEn: 'to be called', translationHu: 'hívnak',
  },
  {
    infinitiv: 'kommen',
    ich: 'komme', du: 'kommst', erSieEs: 'kommt', wir: 'kommen', ihr: 'kommt', sieSie: 'kommen',
    perfekt: 'gekommen', hilfsverb: 'SEIN' as const,
    lesson: 1, difficulty: 1,
    translation: 'doći/dolaziti', translationEn: 'to come', translationHu: 'jönni',
  },
  {
    infinitiv: 'wohnen',
    ich: 'wohne', du: 'wohnst', erSieEs: 'wohnt', wir: 'wohnen', ihr: 'wohnt', sieSie: 'wohnen',
    perfekt: 'gewohnt', hilfsverb: 'HABEN' as const,
    lesson: 1, difficulty: 1,
    translation: 'stanovati', translationEn: 'to live', translationHu: 'lakni',
  },
  {
    infinitiv: 'arbeiten',
    ich: 'arbeite', du: 'arbeitest', erSieEs: 'arbeitet', wir: 'arbeiten', ihr: 'arbeitet', sieSie: 'arbeiten',
    perfekt: 'gearbeitet', hilfsverb: 'HABEN' as const,
    lesson: 1, difficulty: 1,
    translation: 'raditi', translationEn: 'to work', translationHu: 'dolgozni',
  },
  {
    infinitiv: 'sprechen',
    ich: 'spreche', du: 'sprichst', erSieEs: 'spricht', wir: 'sprechen', ihr: 'sprecht', sieSie: 'sprechen',
    perfekt: 'gesprochen', hilfsverb: 'HABEN' as const,
    lesson: 2, difficulty: 2,
    translation: 'govoriti', translationEn: 'to speak', translationHu: 'beszélni',
  },
  {
    infinitiv: 'gehen',
    ich: 'gehe', du: 'gehst', erSieEs: 'geht', wir: 'gehen', ihr: 'geht', sieSie: 'gehen',
    perfekt: 'gegangen', hilfsverb: 'SEIN' as const,
    lesson: 2, difficulty: 1,
    translation: 'ići', translationEn: 'to go', translationHu: 'menni',
  },
  {
    infinitiv: 'machen',
    ich: 'mache', du: 'machst', erSieEs: 'macht', wir: 'machen', ihr: 'macht', sieSie: 'machen',
    perfekt: 'gemacht', hilfsverb: 'HABEN' as const,
    lesson: 2, difficulty: 1,
    translation: 'raditi/praviti', translationEn: 'to do/make', translationHu: 'csinálni',
  },
  {
    infinitiv: 'sehen',
    ich: 'sehe', du: 'siehst', erSieEs: 'sieht', wir: 'sehen', ihr: 'seht', sieSie: 'sehen',
    perfekt: 'gesehen', hilfsverb: 'HABEN' as const,
    lesson: 2, difficulty: 2,
    translation: 'videti', translationEn: 'to see', translationHu: 'látni',
  },
  {
    infinitiv: 'lesen',
    ich: 'lese', du: 'liest', erSieEs: 'liest', wir: 'lesen', ihr: 'lest', sieSie: 'lesen',
    perfekt: 'gelesen', hilfsverb: 'HABEN' as const,
    lesson: 3, difficulty: 2,
    translation: 'čitati', translationEn: 'to read', translationHu: 'olvasni',
  },
  {
    infinitiv: 'schreiben',
    ich: 'schreibe', du: 'schreibst', erSieEs: 'schreibt', wir: 'schreiben', ihr: 'schreibt', sieSie: 'schreiben',
    perfekt: 'geschrieben', hilfsverb: 'HABEN' as const,
    lesson: 3, difficulty: 2,
    translation: 'pisati', translationEn: 'to write', translationHu: 'írni',
  },
  {
    infinitiv: 'fahren',
    ich: 'fahre', du: 'fährst', erSieEs: 'fährt', wir: 'fahren', ihr: 'fahrt', sieSie: 'fahren',
    perfekt: 'gefahren', hilfsverb: 'SEIN' as const,
    lesson: 3, difficulty: 2,
    translation: 'voziti/putovati', translationEn: 'to drive/travel', translationHu: 'utazni/vezetni',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Upsert glagole
  for (const verb of VERBS_LEKTION_1) {
    const created = await prisma.verb.upsert({
      where: { infinitiv: verb.infinitiv },
      create: verb,
      update: verb,
    })

    // Dodaj primere rečenica za 'sein' i 'lernen'
    if (verb.infinitiv === 'sein') {
      await prisma.sentence.upsert({
        where: { id: `seed-sein-1` },
        create: {
          id: 'seed-sein-1',
          verbId: created.id,
          template: `Ich <${created.id},ich> Student.`,
          translation: 'Ja sam student.',
          translationEn: 'I am a student.',
          difficulty: 1,
        },
        update: {},
      })
      await prisma.sentence.upsert({
        where: { id: `seed-sein-2` },
        create: {
          id: 'seed-sein-2',
          verbId: created.id,
          template: `Du <${created.id},du> aus Deutschland?`,
          translation: 'Da li si iz Nemačke?',
          translationEn: 'Are you from Germany?',
          difficulty: 1,
        },
        update: {},
      })
    }

    if (verb.infinitiv === 'lernen') {
      await prisma.sentence.upsert({
        where: { id: 'seed-lernen-1' },
        create: {
          id: 'seed-lernen-1',
          verbId: created.id,
          template: `Wir <${created.id},wir> Deutsch.`,
          translation: 'Mi učimo nemački.',
          translationEn: 'We learn German.',
          difficulty: 1,
        },
        update: {},
      })
    }

    console.log(`  ✅ ${verb.infinitiv}`)
  }

  // Admin nalog (placeholder — registruj se manuelno u Supabase)
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

  // Primer verifikacionih kodova za studente
  const CODES = ['VTS-2025-A1', 'VTS-2025-B2', 'VTS-2025-C3']
  for (const code of CODES) {
    const exists = await prisma.user.findFirst({ where: { verificationCode: code } })
    if (!exists) {
      await prisma.user.create({
        data: {
          email: `placeholder-${code}@vtss.edu.rs`,
          name: 'Placeholder',
          surname: 'Student',
          displayName: `student_${code.slice(-2)}`,
          verificationCode: code,
          isVerified: false,
          role: 'STUDENT',
        },
      })
      console.log(`  🔑 Verifikacioni kod: ${code}`)
    }
  }

  console.log('✅ Seed završen!')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
