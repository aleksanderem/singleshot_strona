import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const Hero: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'hero',
  label: 'Hero (sekcja powitalna)',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    {
      name: 'kicker',
      type: 'text',
      admin: { description: 'Małe oznaczenie nad tytułem (np. "01 / Intro").' },
    },
    {
      name: 'title',
      type: 'array',
      labels: { singular: 'Linia tytułu', plural: 'Linie tytułu' },
      admin: {
        description:
          'Każda linia tytułu osobno (kolejne linie pojawiają się przy scrollu).',
      },
      fields: [
        { name: 'text', type: 'text', required: true },
        {
          name: 'accent',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Czy linia ma być w kolorze akcentowym (kursywa).' },
        },
      ],
    },
    {
      name: 'lede',
      type: 'textarea',
      admin: { description: 'Krótki podtytuł pod nagłówkiem.' },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Wideo scrubowane scrollem (hero video).' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Umów szkolenie',
    },
  ],
}
