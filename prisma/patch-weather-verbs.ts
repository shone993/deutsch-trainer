import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Find verbs that start with regnen or schneien (might have trailing spaces or differ)
  const all = await prisma.verb.findMany({ select: { id: true, infinitiv: true, translation: true } })
  const weather = all.filter(v => v.infinitiv.includes('regnen') || v.infinitiv.includes('schneien'))
  console.log('Weather verbs found:', weather)

  // Find any verbs with null translation and print them
  const missing = all.filter(v => !v.translation)
  console.log(`\nVerbs still missing translation: ${missing.length}`)
  if (missing.length <= 20) {
    missing.forEach(v => console.log(' -', JSON.stringify(v.infinitiv)))
  }

  await prisma.$disconnect()
}
main().catch(console.error)
