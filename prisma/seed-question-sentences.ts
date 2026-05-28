import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

// [template, answer]  — ___ marks the blank where the question word goes
const SENTENCES: [string, string][] = [
  ['___ arbeitest du am Montag?',                                     'Wann'],
  ['Um ___ stehst du auf?',                                           'wie viel Uhr'],
  ['___ ist der Besprechungsraum frei?',                              'Wann'],
  ['___ frühstückst du?',                                             'Wo'],
  ['___ hast du heute einen Termin?',                                 'Bei wem'],
  ['___ heißt sie?',                                                  'Wie'],
  ['___ kommt Herr Ebert? Aus Deutschland?',                          'Woher'],
  ['___ hast du zum Frühstück eingeladen?',                           'Wen'],
  ['___ ruft am Dienstag um 14 Uhr an?',                              'Wer'],
  ['___ ist das Erdgeschoss?',                                        'Wo'],
  ['___ arbeiten Sie?',                                               'In welchem Stock'],
  ['___ gehst du in die Firma?',                                      'Wann'],
  ['___ fährt dein Chef? Nach Deutschland?',                          'Wohin'],
  ['___ steht das Gebäude?',                                          'Wo'],
  ['___ sitzt in der Informatikabteilung?',                           'Wer'],
  ['___ darf man hier nicht machen?',                                 'Was'],
  ['___ muss man pünktlich in der Firma sein?',                       'Wann'],
  ['___ ist im Unternehmen verboten?',                                'Was'],
  ['___ darf man hier nicht parken?',                                 'Warum'],
  ['___ fühlst du dich heute?',                                       'Wie'],
  ['___ ist er heute nicht an seinem Arbeitsplatz?',                  'Warum'],
  ['___ wünscht dir eine gute Besserung?',                            'Wer'],
  ['___ ist passiert?',                                               'Was'],
  ['___ ist am Apparat?',                                             'Wer'],
  ['___ bedankst du dich?',                                           'Wofür'],
  ['___ rufst du morgen an?',                                         'Wen'],
  ['___ hat sich am Telefon verwählt?',                               'Wer'],
  ['___ ist es draußen sonnig?',                                      'Wann'],
  ['___ hast du heute keine Lust auf Kaffee?',                        'Warum'],
  ['___ hast du keine Lust zu arbeiten?',                             'Warum'],
  ['___ fährst du mit dem Zug nach Deutschland?',                     'Wann'],
  ['___ ist das Wetter am Dienstag, bewölkt oder regnerisch?',        'Wie'],
  ['___ freust du dich am meisten?',                                  'Worauf'],
  ['___ freust du dich jetzt?',                                       'Worüber'],
  ['___ ist teurer, der Zug oder der Bus?',                           'Was'],
  ['___ würden Sie gerne trinken?',                                   'Was'],
  ['___ lernen Sie Deutsch?',                                         'Seit wann'],
  ['___ gehst du ins Kino? Mit Anna?',                                'Mit wem'],
  ['___ fahren Sie nach Deutschland? Mit dem Bus?',                   'Womit'],
]

async function main() {
  console.log('Dodajem upitne rečenice...')
  let inserted = 0
  for (const [template, answer] of SENTENCES) {
    await prisma.questionSentence.upsert({
      where: { id: '' },  // force create path via catch
      create: { template, answer, lesson: 13 },
      update: {},
    }).catch(async () => {
      await prisma.questionSentence.create({ data: { template, answer, lesson: 13 } })
    })
    inserted++
    console.log(`  ✅ "${answer}"`)
  }
  console.log(`\nUkupno dodato: ${inserted} rečenica`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
