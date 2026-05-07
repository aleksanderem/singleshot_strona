import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import type { Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Trainings } from './collections/Trainings'
import { PricingCards } from './collections/PricingCards'
import { Principles } from './collections/Principles'
import { Opinions } from './collections/Opinions'
import { Messages } from './collections/Messages'

import { Hero } from './globals/Hero'
import { About } from './globals/About'
import { Wireframe } from './globals/Wireframe'
import { GreenTactics } from './globals/GreenTactics'
import { Contact } from './globals/Contact'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4321'
const SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * Email adapter — SMTP via nodemailer when configured, otherwise skipped
 * (Payload writes outgoing mail to console). Required in prod for password
 * resets and admin invitations.
 */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@singleshot.pl',
      defaultFromName: process.env.SMTP_FROM_NAME || 'SingleShot',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    })
  : undefined

/**
 * S3 (or S3-compatible — R2, Backblaze, MinIO) storage for the Media
 * collection. Activated only when S3_BUCKET is set so dev keeps using the
 * local filesystem under cms/media/.
 */
const plugins: Plugin[] = []
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    }),
  )
}

/**
 * All landing-page collections and globals point at the same homepage URL
 * for live preview — there is only one page on the site, so each edit
 * shows up in that single iframe.
 */
const PREVIEW_URL = (): string => FRONTEND_URL
const PREVIEW_COLLECTIONS = ['trainings', 'pricing-cards', 'principles', 'opinions']
const PREVIEW_GLOBALS = ['hero', 'about', 'wireframe', 'green-tactics', 'contact', 'site-settings']

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: PREVIEW_URL,
      collections: PREVIEW_COLLECTIONS,
      globals: PREVIEW_GLOBALS,
      breakpoints: [
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
        { label: 'Tablet', name: 'tablet', width: 1024, height: 768 },
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
      ],
    },
  },
  serverURL: SERVER_URL,
  cors: [FRONTEND_URL, SERVER_URL],
  csrf: [FRONTEND_URL, SERVER_URL],
  collections: [Users, Media, Trainings, PricingCards, Principles, Opinions, Messages],
  globals: [Hero, About, Wireframe, GreenTactics, Contact, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  email,
  plugins,
})
