/**
 * Replace the pricing-cards collection with the canonical price list
 * (handwritten note from Jarek, 2026-05). Idempotent.
 *
 * Run: pnpm payload run src/seed-pricing.ts
 */
import { getPayload } from 'payload'
import config from './payload.config'

interface CardSeed {
  order: number
  numberLabel: string
  name: string
  nameAccent?: string
  description: string
  price: number
  unit: string
  features: string[]
  featured?: boolean
  badge?: string
  ctaTraining: string
}

const cards: CardSeed[] = [
  {
    order: 1,
    numberLabel: '01',
    name: 'Strzelanie podstawowe',
    nameAccent: 'podstawowe',
    description:
      'Fundamenty bezpiecznej obsługi broni — dla osób stawiających pierwsze kroki.',
    price: 200,
    unit: '/ 1h',
    features: [
      'Bezpieczeństwo na strzelnicy',
      'Postawa, chwyt, celowanie',
      'Pistolet lub karabin',
      'Pierwsze świadome strzały',
    ],
    ctaTraining: 'Strzelanie podstawowe',
  },
  {
    order: 2,
    numberLabel: '02',
    name: 'Strzelanie statyczne z pistoletu',
    nameAccent: 'statyczne',
    description:
      'Praca nad precyzją i powtarzalnością — pod kątem sportowym i rekreacyjnym.',
    price: 250,
    unit: '/ 1h',
    features: [
      'Technika strzału z pistoletu',
      'Grupowanie i analiza',
      'Kontrola oddychania',
      'Indywidualna korekta',
    ],
    ctaTraining: 'Strzelanie statyczne z pistoletu',
  },
  {
    order: 3,
    numberLabel: '03',
    name: 'Strzelanie dynamiczne z pistoletu',
    nameAccent: 'dynamiczne',
    description:
      'Praca w ruchu, zmiany postaw i wielu celach w dynamicznym środowisku.',
    price: 250,
    unit: '/ 1h · + 2 zł / strzał',
    features: [
      'Strzelanie w ruchu',
      'Zmiany postaw strzeleckich',
      'Praca na wielu celach',
      'Bezpieczeństwo dynamiczne',
    ],
    featured: true,
    badge: 'Popularne',
    ctaTraining: 'Strzelanie dynamiczne z pistoletu',
  },
  {
    order: 4,
    numberLabel: '04',
    name: 'Strzelanie bojowe z karabinu i pistoletu',
    nameAccent: 'bojowe',
    description:
      'Elementy użytkowe — osłony, reload, decyzje w stresie. Pistolet + karabin.',
    price: 400,
    unit: '/ 2h · + 3 zł / strzał',
    features: [
      'Praca z osłonami',
      'Zmiany magazynków',
      'Decyzje w stresie',
      'Pistolet + karabin',
    ],
    ctaTraining: 'Strzelanie bojowe — pistolet + karabin',
  },
  {
    order: 5,
    numberLabel: '05',
    name: 'Strzelanie długodystansowe',
    nameAccent: 'długodystansowe',
    description:
      'Praca z lunetą, balistyka i powtarzalny proces strzału na dystansach 200 m+.',
    price: 800,
    unit: '/ 2h · dystans 200 m+',
    features: [
      'Platforma Sako TRG 22',
      'Balistyka zewnętrzna',
      'Czytanie wiatru',
      'Stabilna pozycja strzelecka',
    ],
    ctaTraining: 'Strzelanie długodystansowe — long range',
  },
  {
    order: 6,
    numberLabel: '06',
    name: 'Balistyka',
    nameAccent: 'Balistyka',
    description:
      'Spójna teoria + praktyka: spust, lufa, lot pocisku, czytanie tabel — krok po kroku.',
    price: 150,
    unit: '/ 1h',
    features: [
      'Balistyka wewnętrzna i zewnętrzna',
      'Tabele balistyczne',
      'Praca z lunetą',
      'Praktyczne ćwiczenia',
    ],
    ctaTraining: 'Balistyka',
  },
  {
    order: 7,
    numberLabel: '07',
    name: 'Taktyka zielona',
    nameAccent: 'zielona',
    description:
      'Poruszanie się w terenie, osłony, maskowanie — uzupełnienie do szkoleń strzeleckich.',
    price: 300,
    unit: '/ 2h',
    features: [
      'Czytanie terenu',
      'Naturalne osłony',
      'Podstawy maskowania',
      'Działanie w terenie otwartym',
    ],
    ctaTraining: 'Zielona taktyka',
  },
]

try {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'pricing-cards', where: {} })
  for (const c of cards) {
    await payload.create({
      collection: 'pricing-cards',
      data: {
        order: c.order,
        numberLabel: c.numberLabel,
        name: c.name,
        nameAccent: c.nameAccent,
        description: c.description,
        price: c.price,
        unit: c.unit,
        features: c.features.map((item) => ({ item })),
        featured: c.featured ?? false,
        badge: c.badge,
        ctaLabel: 'Umów szkolenie',
        ctaTraining: c.ctaTraining,
      },
    })
    payload.logger.info(`✓ pricing-card #${c.order}: ${c.name} — ${c.price} zł`)
  }
  payload.logger.info('Pricing seed complete.')
  process.exit(0)
} catch (err) {
  console.error('seed-pricing failed:', err)
  process.exit(1)
}
