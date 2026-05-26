import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

const MISSING: [string, string, string][] = [
  ['benötigen',  'trebati / biti potreban',  'szükségelni / kelleni'],
  ['erwarten',   'očekivati',                'várni / elvárni'],
  ['auswählen',  'odabrati / izabrati',      'kiválasztani'],
  ['räumen',     'ukloniti / isprazniti',    'üríteni / elrendezni'],
]

async function main() {
  for (const [inf, sr, hu] of MISSING) {
    const r = await prisma.verb.updateMany({ where: { infinitiv: inf }, data: { translation: sr, translationHu: hu } })
    console.log(`${inf}: ${r.count > 0 ? '✅' : '⚠ not found'}`)
  }
  await prisma.$disconnect()
}
main().catch(console.error)
