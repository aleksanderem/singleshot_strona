import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const SiteSettings: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'site-settings',
  label: 'Ustawienia strony',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'SingleShot' },
    { name: 'tagline', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'navigation',
      type: 'array',
      labels: { singular: 'Pozycja menu', plural: 'Menu' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'scrollIntensity',
      type: 'number',
      min: 1,
      max: 10,
      defaultValue: 7,
      admin: {
        description:
          'Intensywność animacji scroll (1-10) — wpływa na płynność scrubu hero.',
      },
    },
  ],
}
