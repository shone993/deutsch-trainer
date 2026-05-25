/**
 * Seed imenice (nouns) from APLIKACIJA imenice.xlsx — list "imenice"
 * - col 0: article (der/die/das)
 * - col 1: noun
 * - col 3: Serbian translation
 * - col 4: Hungarian translation
 * - col 5: English translation
 * - Section markers (numbers 2-12) determine lesson number
 *
 * Run: npx tsx prisma/seed-nouns.ts
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

const VALID_ARTICLES = ['der', 'die', 'das']

function cleanArticle(raw: string): string | null {
  const s = raw.trim().toLowerCase()
  // "die (pl.)" → "die"
  if (s.startsWith('die')) return 'die'
  if (s.startsWith('der')) return 'der'
  if (s.startsWith('das')) return 'das'
  return null
}

async function main() {
  const filePath = path.resolve('C:/Users/inspira/Downloads/APLIKACIJA imenice.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets['imenice']
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' })

  const toInsert: Array<{
    id: string
    article: string
    noun: string
    translation: string | null
    translationHu: string | null
    translationEn: string | null
    lesson: number
    isActive: boolean
  }> = []

  let currentLesson = 1
  let skipped = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const col0 = String(row[0] || '').trim()

    // Section marker (number = new lesson)
    if (col0.match(/^\d+$/) && !row[1]) {
      currentLesson = parseInt(col0)
      continue
    }

    const article = cleanArticle(col0)
    const noun = String(row[1] || '').trim()

    if (!article || !noun) {
      skipped++
      continue
    }

    const translation = String(row[3] || '').trim() || null
    const translationHu = String(row[4] || '').trim() || null
    const translationEn = String(row[5] || '').trim() || null

    toInsert.push({
      id: `noun-${noun.toLowerCase().replace(/[^a-züäöß]/g, '-')}`,
      article,
      noun,
      translation,
      translationHu,
      translationEn,
      lesson: currentLesson,
      isActive: true,
    })
  }

  console.log(`Ukupno imenica za insert: ${toInsert.length} (preskočeno: ${skipped})`)

  const result = await prisma.noun.createMany({
    data: toInsert,
    skipDuplicates: true,
  })

  console.log(`✅ Dodato: ${result.count} imenica`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
