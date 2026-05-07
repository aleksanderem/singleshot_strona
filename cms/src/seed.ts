/**
 * One-shot seed of SingleShot landing-page content into Payload.
 *
 * Run with:  pnpm payload run src/seed.ts
 *
 * Behavior: clears every collection/global below and recreates from scratch,
 * so it is safe to re-run while the schema or copy is still moving — but it
 * WILL overwrite admin edits. Once content is being curated in the panel,
 * stop running this.
 */

import { getPayload } from 'payload'
import config from './payload.config'

async function seed(): Promise<void> {
  const payload = await getPayload({ config })

  // ──────────────────────────────────────────────────────────────────
  // Collections — wipe then insert. Order field drives display sort.
  // ──────────────────────────────────────────────────────────────────

  // Trainings
  await payload.delete({ collection: 'trainings', where: {} })
  const trainings = [
    {
      order: 1,
      numberLabel: '01 / 05 — BAZA',
      title: 'Strzelanie podstawowe',
      titleAccent: 'podstawowe',
      description:
        'Bezpieczne i świadome posługiwanie się bronią. Fundamenty techniki, które stanowią bazę do dalszego rozwoju.',
      specs: [
        { key: 'Poziom', value: 'Start' },
        { key: 'Format', value: '1:1 · Grupa' },
        { key: 'Broń', value: 'Pistolet / Karabin' },
      ],
      scrubVideo: false,
      ctaLabel: 'Zapisz się',
      ctaTraining: 'Strzelanie podstawowe',
    },
    {
      order: 2,
      numberLabel: '02 / 05 — PRECYZJA',
      title: 'Strzelanie statyczne z pistoletu',
      titleAccent: 'statyczne',
      subtitle: 'z pistoletu',
      description:
        'Precyzja, kontrola strzału i powtarzalność. Trening pod kątem rekreacyjnym i sportowym. Każdy strzał to decyzja — nie odruch.',
      specs: [
        { key: 'Nacisk', value: 'Powtarzalność' },
        { key: 'Metryka', value: 'Grupowanie' },
        { key: 'Broń', value: 'Pistolet' },
      ],
      scrubVideo: false,
      ctaLabel: 'Zapisz się',
      ctaTraining: 'Strzelanie statyczne z pistoletu',
    },
    {
      order: 3,
      numberLabel: '03 / 05 — RUCH',
      title: 'Strzelanie dynamiczne z pistoletu',
      titleAccent: 'dynamiczne',
      subtitle: 'z pistoletu',
      description:
        'Praca w ruchu, zmiany postaw, praca na wielu celach oraz bezpieczeństwo w dynamicznym środowisku.',
      specs: [
        { key: 'Tempo', value: 'Wysokie' },
        { key: 'Cele', value: 'Wielokrotne' },
        { key: 'Broń', value: 'Pistolet' },
      ],
      scrubVideo: false,
      ctaLabel: 'Zapisz się',
      ctaTraining: 'Strzelanie dynamiczne z pistoletu',
    },
    {
      order: 4,
      numberLabel: '04 / 05 — STRES',
      title: 'Strzelanie bojowe pistolet + karabin',
      titleAccent: 'bojowe',
      subtitle: 'pistolet + karabin',
      description:
        'Realistyczne elementy użytkowe: praca z osłonami, zmiany magazynków, świadome decyzje i kontrola broni w stresie.',
      specs: [
        { key: 'Focus', value: 'Decyzja w stresie' },
        { key: 'Moduły', value: 'Osłony · Reload' },
        { key: 'Broń', value: 'Pistolet + Karabin' },
      ],
      scrubVideo: false,
      ctaLabel: 'Zapisz się',
      ctaTraining: 'Strzelanie bojowe — pistolet + karabin',
    },
    {
      order: 5,
      numberLabel: '05 / 05 — LONG RANGE',
      title: 'Strzelanie długodystansowe precision / long range',
      titleAccent: 'długodystansowe',
      subtitle: 'precision / long range',
      description:
        'Praca z lunetą, balistyka, stabilna pozycja strzelecka oraz budowanie powtarzalnego procesu strzału na większych dystansach.',
      specs: [
        { key: 'Platforma', value: 'Sako TRG 22' },
        { key: 'Dystans', value: '300 m+' },
        { key: 'Warunki', value: 'Czytanie wiatru' },
      ],
      scrubVideo: true,
      ctaLabel: 'Zapisz się',
      ctaTraining: 'Strzelanie długodystansowe — long range',
      anchor: 'long-range',
    },
  ]
  for (const t of trainings) {
    await payload.create({ collection: 'trainings', data: t })
  }

  // PricingCards
  await payload.delete({ collection: 'pricing-cards', where: {} })
  const pricing = [
    {
      order: 1,
      numberLabel: '01',
      name: 'Strzelanie podstawowe',
      nameAccent: 'podstawowe',
      description: 'Fundamenty bezpiecznej obsługi broni — dla osób stawiających pierwsze kroki.',
      price: 250,
      unit: '/ sesja · 1.5h',
      features: [
        { item: 'Bezpieczeństwo na strzelnicy' },
        { item: 'Postawa, chwyt, celowanie' },
        { item: 'Pistolet lub karabin' },
        { item: 'Amunicja w cenie' },
      ],
      featured: false,
      ctaTraining: 'Strzelanie podstawowe',
    },
    {
      order: 2,
      numberLabel: '02',
      name: 'Strzelanie statyczne',
      nameAccent: 'statyczne',
      description: 'Praca nad precyzją i powtarzalnością — pod kątem sportowym i rekreacyjnym.',
      price: 300,
      unit: '/ sesja · 2h',
      features: [
        { item: 'Technika strzału z pistoletu' },
        { item: 'Grupowanie i analiza' },
        { item: 'Kontrola oddychania' },
        { item: 'Indywidualna korekta' },
      ],
      featured: false,
      ctaTraining: 'Strzelanie statyczne z pistoletu',
    },
    {
      order: 3,
      numberLabel: '03',
      name: 'Strzelanie dynamiczne',
      nameAccent: 'dynamiczne',
      description: 'Praca w ruchu, zmiany postaw i wielu celach w dynamicznym środowisku.',
      price: 400,
      unit: '/ sesja · 2.5h',
      features: [
        { item: 'Strzelanie w ruchu' },
        { item: 'Zmiany postaw strzeleckich' },
        { item: 'Praca na wielu celach' },
        { item: 'Bezpieczeństwo dynamiczne' },
      ],
      featured: true,
      badge: 'Popularne',
      ctaTraining: 'Strzelanie dynamiczne z pistoletu',
    },
    {
      order: 4,
      numberLabel: '04',
      name: 'Strzelanie bojowe',
      nameAccent: 'bojowe',
      description: 'Elementy użytkowe — osłony, reload, decyzje w stresie. Pistolet + karabin.',
      price: 500,
      unit: '/ sesja · 3h',
      features: [
        { item: 'Praca z osłonami' },
        { item: 'Zmiany magazynków' },
        { item: 'Decyzje w stresie' },
        { item: 'Pistolet + karabin' },
      ],
      featured: false,
      ctaTraining: 'Strzelanie bojowe — pistolet + karabin',
    },
    {
      order: 5,
      numberLabel: '05',
      name: 'Long range',
      nameAccent: 'Long',
      description: 'Praca z lunetą, balistyka i powtarzalny proces strzału na dystansach 300 m+.',
      price: 600,
      unit: '/ sesja · 3h',
      features: [
        { item: 'Platforma Sako TRG 22' },
        { item: 'Balistyka zewnętrzna' },
        { item: 'Czytanie wiatru' },
        { item: 'Stabilna pozycja strzelecka' },
      ],
      featured: false,
      ctaTraining: 'Strzelanie długodystansowe — long range',
    },
    {
      order: 6,
      numberLabel: '06',
      name: 'Zielona taktyka',
      nameAccent: 'taktyka',
      description:
        'Poruszanie się w terenie, osłony, maskowanie — uzupełnienie do szkoleń strzeleckich.',
      price: 350,
      unit: '/ sesja · 2.5h',
      features: [
        { item: 'Czytanie terenu' },
        { item: 'Naturalne osłony' },
        { item: 'Podstawy maskowania' },
        { item: 'Działanie w terenie otwartym' },
      ],
      featured: false,
      ctaTraining: 'Zielona taktyka',
    },
  ]
  for (const p of pricing) {
    await payload.create({ collection: 'pricing-cards', data: p })
  }

  // Principles
  await payload.delete({ collection: 'principles', where: {} })
  const principles = [
    {
      order: 1,
      numberLabel: 'P / 01',
      title: 'Skupiam się na procesie, a nie na sztuczkach.',
      description:
        'Kursant rozumie, dlaczego coś działa — dzięki temu może powtórzyć to samodzielnie, w realnych warunkach.',
    },
    {
      order: 2,
      numberLabel: 'P / 02',
      title: 'Uczę świadomego strzelania, nie mechanicznego wykonywania poleceń.',
      description:
        'Każdy strzał to decyzja — nie odruch. Pracujemy nad świadomością ciała, broni i otoczenia.',
    },
    {
      order: 3,
      numberLabel: 'P / 03',
      title: 'Szkolenia dopasowane do Ciebie — nie do sztywnego programu.',
      description:
        'Plan i tempo dobieramy do Twoich celów i obecnych umiejętności. Bez schematów, bez presji.',
    },
    {
      order: 4,
      numberLabel: 'P / 04',
      title: 'Bezpieczeństwo jest priorytetem, nie dodatkiem.',
      description:
        'Procedury bezpieczeństwa są fundamentem każdego treningu — od pierwszego kontaktu z bronią po long range.',
    },
    {
      order: 5,
      numberLabel: 'P / 05',
      title: 'Dostajesz realne narzędzia do dalszego, samodzielnego rozwoju.',
      description:
        'Kończysz szkolenie z konkretną metodą pracy, którą możesz stosować dalej — sam lub na kolejnych zajęciach.',
    },
  ]
  for (const p of principles) {
    await payload.create({ collection: 'principles', data: p })
  }

  // Opinions — placeholder pool (HTML page nie ma jeszcze finalnych cytatów)
  await payload.delete({ collection: 'opinions', where: {} })
  const opinions = [
    {
      order: 1,
      author: 'Marek K.',
      rating: 5,
      training: 'Long range',
      quote:
        'Pierwszy raz strzelałem na 600 m. Jarek tłumaczy proces tak, że trafienie wydaje się oczywiste — ale dopiero po lekcji rozumiesz, ile rzeczy musi się zgrać.',
    },
    {
      order: 2,
      author: 'Anna W.',
      rating: 5,
      training: 'Strzelanie statyczne',
      quote:
        'Świetnie poprowadzone szkolenie 1:1. Po dwóch godzinach miałam stabilne grupowanie i — co ważniejsze — wiedziałam dlaczego.',
    },
    {
      order: 3,
      author: 'Tomek S.',
      rating: 5,
      training: 'Strzelanie dynamiczne',
      quote:
        'Bezpieczeństwo na pierwszym miejscu, ale bez przeprosin. Pracowaliśmy realnie z ruchem i zmianami postaw.',
    },
  ]
  for (const o of opinions) {
    await payload.create({ collection: 'opinions', data: o })
  }

  // ──────────────────────────────────────────────────────────────────
  // Globals — single documents per slug, just update.
  // ──────────────────────────────────────────────────────────────────

  await payload.updateGlobal({
    slug: 'hero',
    data: {
      kicker: 'Szkolenia strzeleckie · Jarek · Est. 2010',
      title: [
        { text: 'One shot.', accent: false },
        { text: 'One decision.', accent: true },
      ],
      lede: 'Świadome strzelanie. Bez sztuczek, bez presji. Od pierwszego kontaktu z bronią po precyzyjny long range.',
      ctaLabel: 'Umów szkolenie',
    },
  })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      kicker: 'O MNIE',
      name: 'Jarek',
      role: 'Instruktor strzelectwa',
      paragraphs: [
        {
          body: 'Strzelectwem zajmuję się nieprzerwanie od 2010 roku. Instruktor strzelectwa, w tym strzelania długodystansowego. Prowadzę szkolenia z wykorzystaniem elementów zielonej taktyki.',
        },
        {
          body: 'W szkoleniach przykładam ogromną wagę do bezpieczeństwa, świadomego posługiwania się bronią i zrozumienia procesu strzału — tak, aby kursant wiedział dlaczego coś działa, a nie tylko jak to wykonać.',
        },
        {
          body: 'Prywatnie pasjonuje mnie broń krótka, a szczególne miejsce zajmuje u mnie Glock — ale uczę strzelać z każdej broni, niezależnie od marki czy systemu. W strzelaniu tarczowym cenię kaliber .222 Remington, a w długodystansowym pracuję m.in. na platformie Sako TRG 22.',
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'wireframe',
    data: {
      kicker: 'Balistyka',
      title: 'Proces strzału',
      titleAccent: 'strzału',
      subtitle: 'od początku do końca.',
      description:
        'Zrozumienie tego, co dzieje się między decyzją a trafieniem — od spustu, przez komorę, lot pocisku, po cel.',
      tags: [
        { label: '01 / Spust' },
        { label: '02 / Komora' },
        { label: '03 / Lufa' },
        { label: '04 / Lot' },
        { label: '05 / Trafienie' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'green-tactics',
    data: {
      kicker: 'Szkolenia uzupełniające',
      sectionNumber: '/ 04',
      title: 'Elementy zielonej taktyki',
      titleAccent: 'zielonej',
      description:
        'Poruszanie się w terenie, wykorzystanie naturalnych osłon, podstawy maskowania i świadome działanie w środowisku otwartym — w ujęciu szkoleniowym i strzeleckim.',
      features: [
        {
          numberLabel: '01 · Teren',
          title: 'Teren',
          description: 'Czytanie ukształtowania terenu i bezpieczne poruszanie.',
        },
        {
          numberLabel: '02 · Osłony',
          title: 'Osłony',
          description: 'Naturalne osłony, linie widzenia, pola ostrzału.',
        },
        {
          numberLabel: '03 · Maskowanie',
          title: 'Maskowanie',
          description: 'Podstawy kamuflażu i redukcja sygnatury w polu.',
        },
        {
          numberLabel: '04 · Decyzja',
          title: 'Decyzja',
          description: 'Świadome działanie w otwartym środowisku.',
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'contact',
    data: {
      phone: '+48 000 000 000',
      email: 'kontakt@singleshot.pl',
      address: '',
      mapsUrl: '',
      socials: [{ label: '@singleshot.pl (Instagram)', url: '#' }],
      footerNote: 'Szkolenia strzeleckie · PL · Est. 2010',
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'SingleShot',
      tagline: 'Szkolenia strzeleckie · PL · Est. 2010',
      navigation: [
        { label: 'O mnie', href: '#o-mnie' },
        { label: 'Dla kogo', href: '#dla-kogo' },
        { label: 'Szkolenia', href: '#szkolenia' },
        { label: 'Cennik', href: '#cennik' },
        { label: 'Dlaczego', href: '#dlaczego' },
        { label: 'Kontakt', href: '#kontakt' },
      ],
      scrollIntensity: 7,
    },
  })

  payload.logger.info('Seed complete.')
}

// Top-level await so `payload run` waits for the seed to finish before
// the parent process exits.
try {
  await seed()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
