/**
 * Build-time fetchers for Payload REST API. Used inside Astro page
 * frontmatter so all content is baked into static HTML at `astro build`.
 *
 * Public-read access on the relevant collections/globals is configured in
 * `cms/src/collections/*` and `cms/src/globals/*`. No auth header needed.
 */

const PAYLOAD_URL = import.meta.env.PAYLOAD_URL || 'http://localhost:3000'

export interface Spec {
  key: string
  value: string
}

export interface Training {
  id: number
  order: number
  numberLabel: string
  title: string
  titleAccent?: string | null
  subtitle?: string | null
  description: string
  specs?: Spec[] | null
  scrubVideo?: boolean | null
  ctaLabel?: string | null
  ctaTraining?: string | null
  anchor?: string | null
  video?: { url?: string; filename?: string } | number | null
}

export interface PricingFeature {
  item: string
}

export interface PricingCard {
  id: number
  order: number
  numberLabel: string
  name: string
  nameAccent?: string | null
  description: string
  price: number
  unit: string
  features?: PricingFeature[] | null
  featured?: boolean | null
  badge?: string | null
  ctaLabel?: string | null
  ctaTraining?: string | null
}

export interface Principle {
  id: number
  order: number
  numberLabel: string
  title: string
  description?: string | null
}

export interface Opinion {
  id: number
  order: number
  author: string
  rating?: number | null
  training?: string | null
  quote: string
}

export interface HeroLine {
  text: string
  accent?: boolean | null
}

export interface MediaRef {
  id: number
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  alt?: string | null
}

export interface Hero {
  kicker?: string | null
  title?: HeroLine[] | null
  lede?: string | null
  ctaLabel?: string | null
  video?: MediaRef | number | null
}

export interface AboutParagraph {
  body: string
}

export interface About {
  kicker?: string | null
  name: string
  role?: string | null
  paragraphs?: AboutParagraph[] | null
  video?: MediaRef | number | null
  image?: MediaRef | number | null
}

export interface WireframeTag {
  label: string
}

export interface Wireframe {
  kicker?: string | null
  title: string
  titleAccent?: string | null
  subtitle?: string | null
  description?: string | null
  tags?: WireframeTag[] | null
  video?: MediaRef | number | null
}

export interface GreenFeature {
  numberLabel: string
  title: string
  description: string
}

export interface GreenTactics {
  kicker?: string | null
  sectionNumber?: string | null
  title: string
  titleAccent?: string | null
  description?: string | null
  features?: GreenFeature[] | null
  video?: MediaRef | number | null
}

export interface Social {
  label: string
  url: string
}

export interface Contact {
  phone?: string | null
  email?: string | null
  address?: string | null
  mapsUrl?: string | null
  socials?: Social[] | null
  footerNote?: string | null
}

export interface NavItem {
  label: string
  href: string
}

export interface SiteSettings {
  siteName?: string | null
  tagline?: string | null
  navigation?: NavItem[] | null
  scrollIntensity?: number | null
}

interface ListResponse<T> {
  docs: T[]
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${PAYLOAD_URL}${path}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Payload fetch failed: ${url} → ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

async function getList<T>(slug: string, sort = 'order'): Promise<T[]> {
  const data = await getJson<ListResponse<T>>(
    `/api/${slug}?limit=100&sort=${encodeURIComponent(sort)}&depth=1`,
  )
  return data.docs
}

async function getGlobal<T>(slug: string): Promise<T> {
  return await getJson<T>(`/api/globals/${slug}?depth=1`)
}

export const getTrainings = (): Promise<Training[]> => getList<Training>('trainings')
export const getPricing = (): Promise<PricingCard[]> => getList<PricingCard>('pricing-cards')
export const getPrinciples = (): Promise<Principle[]> => getList<Principle>('principles')
export const getOpinions = (): Promise<Opinion[]> => getList<Opinion>('opinions')

export const getHero = (): Promise<Hero> => getGlobal<Hero>('hero')
export const getAbout = (): Promise<About> => getGlobal<About>('about')
export const getWireframe = (): Promise<Wireframe> => getGlobal<Wireframe>('wireframe')
export const getGreenTactics = (): Promise<GreenTactics> =>
  getGlobal<GreenTactics>('green-tactics')
export const getContact = (): Promise<Contact> => getGlobal<Contact>('contact')
export const getSiteSettings = (): Promise<SiteSettings> =>
  getGlobal<SiteSettings>('site-settings')
