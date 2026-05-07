import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const GreenTactics: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'green-tactics',
  label: 'Zielona taktyka',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    { name: 'kicker', type: 'text', defaultValue: 'Szkolenia uzupełniające' },
    { name: 'sectionNumber', type: 'text', defaultValue: '/ 04' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleAccent', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'features',
      type: 'array',
      labels: { singular: 'Cecha', plural: 'Cechy' },
      fields: [
        { name: 'numberLabel', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
