/**
 * Seed OSTALO reči from APLIKACIJA imenice.xlsx — list "OSTALO"
 * - col 0: German word
 * - col 2: Serbian translation
 * - col 3: Hungarian translation
 * - col 4: English translation
 *
 * Run: npx tsx prisma/seed-words.ts
 */
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

import * as XLSX from 'xlsx'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  const filePath = path.resolve('C:/Users/inspira/Downloads/APLIKACIJA imenice.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets['OSTALO']
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' })

  const toInsert: Array<{
    id: string
    word: string
    translation: string | null
    translationHu: string | null
    translationEn: string | null
    isActive: boolean
  }> = []

  let skipped = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const word = String(row[0] || '').trim()

    // Skip empty rows or number headers
    if (!word || word.match(/^\d+$/)) {
      skipped++
      continue
    }

    const translation = String(row[2] || '').trim() || null
    const translationHu = String(row[3] || '').trim() || null
    const translationEn = String(row[4] || '').trim() || null

    toInsert.push({
      id: `word-${word.toLowerCase().replace(/[^a-züäöß]/g, '-')}`,
      word,
      translation,
      translationHu,
      translationEn,
      isActive: true,
    })
  }

  console.log(`Ukupno reči za insert: ${toInsert.length} (preskočeno: ${skipped})`)

  const result = await prisma.word.createMany({
    data: toInsert,
    skipDuplicates: true,
  })

  console.log(`✅ Dodato: ${result.count} reči`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
