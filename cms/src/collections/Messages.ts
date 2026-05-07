import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Wiadomość', plural: 'Wiadomości (skrzynka)' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'name', 'email', 'training', 'phone'],
    description: 'Zgłoszenia z formularza kontaktowego ze strony.',
  },
  defaultSort: '-createdAt',
  access: {
    // Anyone (anonymous form submissions) can create. Read/edit/delete only
    // for authenticated admins.
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation !== 'create') return doc
        const to = process.env.CONTACT_FORM_TO
        if (!to) return doc
        try {
          await req.payload.sendEmail({
            to,
            subject: `Nowe zgłoszenie · ${doc.training || doc.name || 'kontakt'}`,
            text: [
              `Imię: ${doc.name}`,
              `E-mail: ${doc.email}`,
              `Telefon: ${doc.phone || '—'}`,
              `Szkolenie: ${doc.training || '—'}`,
              '',
              doc.message || '(brak wiadomości)',
            ].join('\n'),
            replyTo: doc.email,
          })
          req.payload.logger.info(`[messages] notification mail sent to ${to}`)
        } catch (err) {
          req.payload.logger.error(
            `[messages] mail send failed: ${err instanceof Error ? err.message : String(err)}`,
          )
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Imię i nazwisko' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', label: 'Telefon' },
    {
      name: 'training',
      type: 'text',
      label: 'Szkolenie',
      admin: { description: 'Nazwa wybranego szkolenia z formularza.' },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Wiadomość',
      admin: { rows: 5 },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'URL źródłowy',
      admin: { description: 'Strona, z której wysłano zgłoszenie.', readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true, description: 'User-Agent przeglądarki.' },
    },
    {
      name: 'handled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Załatwione',
      admin: { description: 'Zaznacz po obsłużeniu zgłoszenia.' },
    },
  ],
  timestamps: true,
}
