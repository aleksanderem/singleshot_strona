import type { CollectionConfig } from 'payload'

import {
  triggerRebuildAfterChange,
  triggerRebuildAfterDelete,
} from '../hooks/triggerRebuild'

export const Principles: CollectionConfig = {
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  slug: 'principles',
  labels: {
    singular: 'Zasada',
    plural: 'Zasady',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title'],
    description: 'Sekcja "Proces. Nie sztuczki." — zasady pracy.',
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [triggerRebuildAfterChange],
    afterDelete: [triggerRebuildAfterDelete],
  },
  fields: [
    { name: 'order', type: 'number', required: true },
    { name: 'numberLabel', type: 'text', required: true, admin: { description: 'Np. "01".' } },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
  ],
}
