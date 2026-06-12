import { prisma } from '../lib/db/prisma'

const SEARCH_TERMS = ['treffen', 'bedanken', 'freuen', 'fühlen', 'interessieren']

async function main() {
  for (const term of SEARCH_TERMS) {
    const verbs = await prisma.verb.findMany({
      where: { infinitiv: { contains: term } },
      select: { infinitiv: true, ich: true, du: true, erSieEs: true, wir: true, ihr: true, sieSie: true },
    })
    for (const v of verbs) {
      console.log(`\n${v.infinitiv}:`)
      console.log(`  ich: ${v.ich} | du: ${v.du} | er: ${v.erSieEs}`)
      console.log(`  wir: ${v.wir} | ihr: ${v.ihr} | sie: ${v.sieSie}`)
    }
  }
  await prisma.$disconnect()
}

main().catch(console.error)
