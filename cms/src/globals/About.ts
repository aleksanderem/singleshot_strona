import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const About: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'about',
  label: 'O Jarku (sekcja About)',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    { name: 'kicker', type: 'text', admin: { description: 'Np. "02 / O mnie".' } },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', admin: { description: 'Np. "Instruktor strzelectwa".' } },
    {
      name: 'paragraphs',
      type: 'array',
      labels: { singular: 'Akapit', plural: 'Akapity' },
      fields: [{ name: 'body', type: 'textarea', required: true }],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Wideo wyświetlane po lewej stronie sekcji.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Alternatywne zdjęcie (jeśli bez video).' },
    },
  ],
}
