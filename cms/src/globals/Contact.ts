import type { GlobalConfig } from 'payload'

import { triggerRebuildAfterGlobalChange } from '../hooks/triggerRebuild'

export const Contact: GlobalConfig = {
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  slug: 'contact',
  label: 'Kontakt i stopka',
  hooks: {
    afterChange: [triggerRebuildAfterGlobalChange],
  },
  fields: [
    { name: 'phone', type: 'text', admin: { description: 'Np. "+48 692 ...".' } },
    { name: 'email', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'mapsUrl', type: 'text' },
    {
      name: 'socials',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'footerNote', type: 'textarea' },
  ],
}
