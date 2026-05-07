import type { CollectionConfig } from 'payload'

import {
  triggerRebuildAfterChange,
  triggerRebuildAfterDelete,
} from '../hooks/triggerRebuild'

export const PricingCards: CollectionConfig = {
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  slug: 'pricing-cards',
  labels: {
    singular: 'Karta cennika',
    plural: 'Cennik',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['order', 'name', 'price', 'unit'],
    description: 'Sekcja cennika na stronie głównej.',
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [triggerRebuildAfterChange],
    afterDelete: [triggerRebuildAfterDelete],
  },
  fields: [
    {
      name: 'order',
      type: 'number',
      required: true,
    },
    {
      name: 'numberLabel',
      type: 'text',
      required: true,
      admin: { description: 'Np. "01".' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'nameAccent',
      type: 'text',
      admin: { description: 'Akcentowana część nazwy (kursywa).' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: { description: 'Cena w PLN.' },
    },
    {
      name: 'unit',
      type: 'text',
      required: true,
      admin: { description: 'Np. "/ sesja · 2h".' },
    },
    {
      name: 'features',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Wyróżnić jako "Popularne".' },
    },
    {
      name: 'badge',
      type: 'text',
      admin: { description: 'Tekst plakietki (np. "Popularne").' },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Umów szkolenie',
    },
    {
      name: 'ctaTraining',
      type: 'text',
      admin: {
        description: 'Wartość pola "szkolenie" w formularzu kontaktowym.',
      },
    },
  ],
}
