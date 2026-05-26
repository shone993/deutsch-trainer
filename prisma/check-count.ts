import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }) })
async function run() {
  const total = await prisma.verb.count({ where: { isActive: true } })
  const withSr = await prisma.verb.count({ where: { isActive: true, translation: { not: null } } })
  const withHu = await prisma.verb.count({ where: { isActive: true, translationHu: { not: null } } })
  console.log('Ukupno aktivnih glagola:', total)
  console.log('Sa srpskim prevodom:   ', withSr)
  console.log('Sa madarskim prevodom: ', withHu)
  const still = await prisma.verb.findMany({ where: { isActive: true, translation: null }, select: { infinitiv: true } })
  if (still.length) console.log('Bez prevoda:', still.map(v => v.infinitiv))
  await prisma.$disconnect()
}
run().catch(console.error)
