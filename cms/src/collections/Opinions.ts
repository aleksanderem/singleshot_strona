import type { CollectionConfig } from 'payload'

import {
  triggerRebuildAfterChange,
  triggerRebuildAfterDelete,
} from '../hooks/triggerRebuild'

export const Opinions: CollectionConfig = {
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  slug: 'opinions',
  labels: {
    singular: 'Opinia',
    plural: 'Opinie',
  },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['order', 'author', 'rating'],
    description: 'Opinie kursantów wyświetlane w sekcji opinii.',
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [triggerRebuildAfterChange],
    afterDelete: [triggerRebuildAfterDelete],
  },
  fields: [
    { name: 'order', type: 'number', required: true },
    { name: 'author', type: 'text', required: true },
    { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'training',
      type: 'text',
      admin: { description: 'Z jakiego szkolenia, np. "Long range".' },
    },
  ],
}
