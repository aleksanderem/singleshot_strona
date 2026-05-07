import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const Wireframe: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'wireframe',
  label: 'Proces strzału (sekcja balistyki)',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    {
      name: 'kicker',
      type: 'text',
      defaultValue: 'Balistyka',
    },
    { name: 'title', type: 'text', required: true },
    { name: 'titleAccent', type: 'text', admin: { description: 'Akcentowana część tytułu.' } },
    { name: 'subtitle', type: 'text', admin: { description: 'Druga linia tytułu.' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tagi' },
      admin: { description: 'Etykiety etapów (np. "01 / Spust").' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Wideo wireframe scrubowane scrollem.' },
    },
  ],
}
