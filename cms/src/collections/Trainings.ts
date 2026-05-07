import type { CollectionConfig } from 'payload'

import {
  triggerRebuildAfterChange,
  triggerRebuildAfterDelete,
} from '../hooks/triggerRebuild'

export const Trainings: CollectionConfig = {
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  slug: 'trainings',
  labels: {
    singular: 'Szkolenie',
    plural: 'Szkolenia',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'tagline'],
    description:
      'Pięć dróg, jeden proces — sekcja "Trainings" na stronie głównej.',
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
      admin: { description: 'Kolejność wyświetlania (1–5).' },
    },
    {
      name: 'numberLabel',
      type: 'text',
      required: true,
      admin: { description: 'Np. "01 / 05 — BAZA".' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Główny tytuł karty, np. "Strzelanie podstawowe".' },
    },
    {
      name: 'titleAccent',
      type: 'text',
      admin: {
        description: 'Część tytułu w akcentowym kolorze (kursywa).',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: { description: 'Druga linia tytułu, np. "precision / long range".' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'specs',
      type: 'array',
      labels: { singular: 'Spec', plural: 'Specyfikacje' },
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Plik wideo do tła karty.' },
    },
    {
      name: 'scrubVideo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Czy video ma być scrubowane scrollem (jak w long-range). Domyślnie autoplay loop.',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Zapisz się',
    },
    {
      name: 'ctaTraining',
      type: 'text',
      admin: {
        description:
          'Wartość przekazywana do formularza kontaktowego (np. "Strzelanie długodystansowe — long range").',
      },
    },
    {
      name: 'anchor',
      type: 'text',
      admin: {
        description: 'Anchor HTML (np. "long-range") jeśli sekcja ma być linkowana.',
      },
    },
  ],
}
