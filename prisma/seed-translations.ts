/**
 * Ažurira srpske i mađarske prevode za sve glagole u bazi.
 * Pokretanje: npx ts-node --project tsconfig.seed.json prisma/seed-translations.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! })
const prisma = new PrismaClient({ adapter })

// [infinitiv, srpski, mađarski]
const TRANSLATIONS: [string, string, string][] = [
  // Lekcija 1
  ['sein',               'biti',                          'lenni / van'],
  ['kommen',             'doći / dolaziti',               'jönni'],
  ['sprechen',           'govoriti',                      'beszélni'],
  ['haben',              'imati',                         'van / bírni'],
  ['arbeiten',           'raditi',                        'dolgozni'],
  ['studieren',          'studirati',                     'tanulni (főiskolán)'],
  ['trinken',            'piti',                          'inni'],
  ['anrufen',            'nazvati (telefonom)',            'felhívni'],
  ['helfen',             'pomoći',                        'segíteni'],
  ['können',             'moći',                          'tudni / -hat/-het'],
  ['müssen',             'morati',                        'kell / muszáj'],
  ['wollen',             'hteti / željeti',               'akarni'],
  ['sollen',             'trebati',                       'kelleni'],
  ['dürfen',             'smeti',                         'szabad'],
  ['mögen',              'voleti / sviđati se',           'szeretni / tetszeni'],
  // Lekcija 2
  ['gehen',              'ići',                           'menni'],
  ['machen',             'raditi / praviti',              'csinálni'],
  ['sagen',              'reći',                          'mondani'],
  ['wohnen',             'stanovati',                     'lakni'],
  ['lernen',             'učiti',                         'tanulni'],
  ['lesen',              'čitati',                        'olvasni'],
  ['schreiben',          'pisati',                        'írni'],
  ['essen',              'jesti',                         'enni'],
  ['kaufen',             'kupiti',                        'vásárolni'],
  ['fahren',             'voziti / putovati',             'utazni (járművel)'],
  ['fliegen',            'leteti',                        'repülni'],
  ['sehen',              'videti',                        'látni'],
  ['hören',              'slušati / čuti',                'hallani'],
  ['finden',             'naći / pronaći',                'találni'],
  ['geben',              'dati',                          'adni'],
  ['nehmen',             'uzeti',                         'venni'],
  ['wissen',             'znati',                         'tudni (vmit)'],
  ['kennen',             'poznavati',                     'ismerni'],
  ['denken',             'misliti',                       'gondolni'],
  ['verstehen',          'razumeti',                      'érteni'],
  ['spielen',            'igrati / svirati',              'játszani'],
  ['stehen',             'stajati',                       'állni'],
  ['liegen',             'ležati',                        'feküdni'],
  ['schlafen',           'spavati',                       'aludni'],
  ['bleiben',            'ostati',                        'maradni'],
  ['werden',             'postajati / postati',           'válni / lesz'],
  ['fragen',             'pitati',                        'kérdezni'],
  ['heißen',             'zvati se',                      'hívják / neve'],
  ['leben',              'živeti',                        'élni'],
  ['reisen',             'putovati',                      'utazni'],
  ['kosten',             'koštati',                       'kerül (vmibe)'],
  ['zahlen',             'platiti',                       'fizetni'],
  ['brauchen',           'trebati / trebovati',           'szükség van'],
  ['suchen',             'tražiti',                       'keresni'],
  // Lekcija 3
  ['beginnen',           'početi',                        'kezdeni'],
  ['anfangen',           'početi / krenuti',              'elkezdeni'],
  ['beenden',            'završiti',                      'befejezni'],
  ['planen',             'planirati',                     'tervezni'],
  ['organisieren',       'organizovati',                  'szervezni'],
  ['vorbereiten',        'pripremiti',                    'előkészíteni'],
  ['treffen, sich',      'naći se / sresti se',           'találkozni'],
  ['freuen, sich',       'radovati se',                   'örülni'],
  ['interessieren, sich','interesovati se',               'érdeklődni'],
  ['entschuldigen, sich','izviniti se',                   'bocsánatot kérni'],
  ['befinden, sich',     'nalaziti se',                   'tartózkodni / van (valahol)'],
  ['bedanken, sich',     'zahvaliti se',                  'megköszönni'],
  ['bewerben, sich',     'prijaviti se (za posao)',       'pályázni'],
  ['anmelden, sich',     'prijaviti se / registrovati se','regisztrálni / bejelenteni'],
  ['melden, sich',       'javiti se',                     'jelentkezni'],
  ['setzen, sich',       'sesti',                         'leülni'],
  // Lekcija 4
  ['hoffen',             'nadati se',                     'remélni'],
  ['wünschen',           'željeti / poželeti',            'kívánni'],
  ['stören',             'smetati',                       'zavarni'],
  ['tun',                'raditi / činiti',               'tenni / csinálni'],
  ['lauten',             'glasiti / zvučati',             'hangzani'],
  ['reden',              'razgovarati / pričati',         'beszélni'],
  ['telefonieren',       'telefonirati',                  'telefonálni'],
  ['feiern',             'slaviti / proslaviti',          'ünnepelni'],
  ['sammeln',            'skupljati / sakupljati',        'gyűjteni'],
  ['rauchen',            'pušiti',                        'dohányozni'],
  ['fotografieren',      'fotografisati',                 'fényképezni'],
  ['aussehen',           'izgledati',                     'kinézni'],
  ['gefallen',           'sviđati se',                    'tetszeni'],
  ['bekommen',           'dobiti',                        'kapni'],
  ['erklären',           'objasniti',                     'magyarázni'],
  ['zeigen',             'pokazati',                      'mutatni'],
  ['einladen',           'pozvati',                       'meghívni'],
  ['besuchen',           'posetiti',                      'meglátogatni'],
  ['buchstabieren',      'sloviti',                       'betűzni'],
  // Lekcija 5
  ['grüßen',             'pozdraviti',                    'üdvözölni'],
  ['begrüßen',           'pozdraviti / dočekati',         'üdvözölni / fogadni'],
  ['kennen lernen',      'upoznati',                      'megismerni'],
  ['vorstellen',         'predstaviti',                   'bemutatni'],
  ['messen',             'meriti',                        'mérni'],
  ['schwimmen',          'plivati',                       'úszni'],
  ['schmecken',          'biti ukusan',                   'ízleni'],
  ['regnen',             'kišiti',                        'esni (az eső)'],
  ['schneien',           'snežiti',                       'havazni'],
  ['funktionieren',      'funkcionisati',                 'működni'],
  ['ansehen',            'pogledati',                     'megnézni'],
  ['anbieten',           'ponuditi',                      'felajánlani'],
  ['vorziehen',          'preferovati / više voleti',     'előnyben részesíteni'],
  // Lekcija 6
  ['speichern',          'sačuvati / snimiti',            'menteni'],
  ['löschen',            'izbrisati',                     'törölni'],
  ['installieren',       'instalirati',                   'telepíteni'],
  ['starten',            'pokrenuti',                     'elindítani'],
  ['herunterladen',      'preuzeti / skinuti',            'letölteni'],
  ['hochladen',          'otpremiti / postaviti',         'feltölteni'],
  ['anklicken',          'kliknuti na',                   'rákattintani'],
  ['öffnen',             'otvoriti',                      'megnyitni'],
  ['zumachen',           'zatvoriti',                     'becsukni'],
  ['einschalten',        'uključiti',                     'bekapcsolni'],
  ['ausschalten',        'isključiti',                    'kikapcsolni'],
  ['anmachen',           'uključiti / zapaliti',          'bekapcsolni'],
  ['ausmachen',          'ugasiti / isključiti',          'kikapcsolni'],
  ['ändern',             'promeniti',                     'módosítani / megváltoztatni'],
  ['anschließen',        'priključiti',                   'csatlakoztatni'],
  ['drücken',            'pritisnuti',                    'nyomni'],
  ['verwählen, sich',    'pogrešno birati broj',          'elhibázni a számot'],
  // Lekcija 7
  ['recherchieren',      'istraživati / pretraživati',    'utánajárni / kutatni'],
  ['erstellen',          'kreirati / napraviti',          'létrehozni'],
  ['eintragen',          'uneti / upisati',               'beírni'],
  ['ausfüllen',          'popuniti',                      'kitölteni'],
  ['formulieren',        'formulisati',                   'megfogalmazni'],
  ['benutzen',           'koristiti',                     'használni'],
  ['verwenden',          'koristiti / upotrebljavati',    'használni / alkalmazni'],
  ['vergleichen',        'uporediti',                     'összehasonlítani'],
  ['zuordnen',           'razvrstati / dodeliti',         'hozzárendelni'],
  ['bestätigen',         'potvrditi',                     'megerősíteni'],
  ['korrigieren',        'ispraviti / korigovati',        'javítani'],
  ['wiederholen',        'ponoviti',                      'ismételni'],
  ['vergessen',          'zaboraviti',                    'elfelejteni'],
  ['darstellen',         'prikazivati / predstavljati',   'bemutatni / ábrázolni'],
  ['bilden',             'obrazovati / formirati',        'képezni / alkotni'],
  ['ausrichten',         'preneti poruku / prosleđivati', 'átadni (üzenetet)'],
  ['hinterlassen',       'ostaviti (poruku)',             'hátrahagyni / üzenni'],
  // Lekcija 8
  ['zurückrufen',        'povratiti poziv',               'visszahívni'],
  ['absagen',            'otkazati',                      'lemondani'],
  ['vereinbaren',        'dogovoriti',                    'megállapodni'],
  ['vorschlagen',        'predložiti',                    'javasolni'],
  ['empfangen',          'primiti / dočekati',            'fogadni / venni'],
  ['erreichen',          'dostići / kontaktirati',        'elérni'],
  ['erlauben',           'dozvoliti',                     'engedélyezni'],
  ['verbieten',          'zabraniti',                     'megtiltani'],
  ['vorkommen',          'desiti se / pojaviti se',       'előfordulni'],
  ['stattfinden',        'održati se / odvijati se',      'megtartani / megtörténni'],
  ['dauern',             'trajati',                       'tartani (ideig)'],
  ['passen',             'odgovarati / pristajati',       'illik / megfelelni'],
  ['fehlen',             'nedostajati',                   'hiányozni'],
  ['betragen',           'iznositi (novčano)',             'kitesz (összeget)'],
  // Lekcija 9
  ['ankommen',           'stići / doći',                  'megérkezni'],
  ['sparen',             'štedeti / uštedeti',            'takarékoskodni'],
  ['aufräumen',          'pospremiti',                    'rendet rakni'],
  ['herstellen',         'praviti / proizvoditi',         'gyártani / előállítani'],
  ['produzieren',        'producirati / proizvoditi',     'gyártani'],
  ['modellieren',        'modelovati',                    'modellezni'],
  ['holen',              'uzeti / doneti',                'hozni / elmenni érte'],
  ['einschenken',        'natočiti / sipati',             'tölteni / felszolgálni'],
  ['frühstücken',        'doručkovati',                   'reggelizni'],
  // Lekcija 10
  ['beachten',           'voditi računa / obratiti pažnju','figyelembe venni'],
  ['befragen',           'ispitati / anketirati',         'megkérdezni'],
  ['rauchen',            'pušiti',                        'dohányozni'],
  ['fühlen, sich',       'osećati se',                    'érezni magát'],
  // Lekcija 11
  ['anpinnen',           'prikačiti / zakačiti',          'kitűzni / rögzíteni'],
  ['entpacken',          'raspakirati',                   'kicsomagolni'],
  ['verschieben',        'pomeriti / odložiti',           'eltolni / elhalasztani'],
  ['verbinden',          'spojiti / povezati',            'összekötni / kapcsolni'],
  // Lekcija 12
  ['übernehmen',         'preuzeti',                      'átvenni'],
  ['versuchen',          'pokušati',                      'megpróbálni'],
  ['lassen',             'pustiti / ostaviti',            'hagyni / engedni'],
  ['gewinnen',           'pobediti / dobiti',             'nyerni'],
  ['fließen',            'teći',                          'folyni'],
  ['herunterffahren',    'isključiti (računar)',           'leállítani (számítógépet)'],
  ['herunterfahren',     'isključiti (računar)',           'leállítani (számítógépet)'],
  // Razno
  ['mitbringen',         'doneti sa sobom',               'magával hozni'],
  ['telefonieren',       'telefonirati',                  'telefonálni'],
  ['rauchen',            'pušiti',                        'dohányozni'],
]

async function main() {
  console.log('Ažuriram prevode za glagole...')
  let updated = 0
  let notFound = 0

  for (const [infinitiv, sr, hu] of TRANSLATIONS) {
    const result = await prisma.verb.updateMany({
      where: { infinitiv },
      data: { translation: sr, translationHu: hu },
    })
    if (result.count > 0) {
      updated++
    } else {
      console.warn(`  ⚠ Nije pronađen: "${infinitiv}"`)
      notFound++
    }
  }

  console.log(`\n✅ Ažurirano: ${updated} glagola`)
  if (notFound > 0) console.log(`⚠  Nije pronađeno: ${notFound}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
