/**
 * Upload SingleShot landing-page videos into Payload Media collection
 * and wire each one to the right Training / Hero / About / Wireframe /
 * Green Tactics record. Idempotent — re-running replaces existing
 * Media docs by `alt` slug and re-points relations.
 *
 * Run: pnpm payload run src/seed-media.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from './payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VIDEOS_DIR = path.resolve(__dirname, '../../videos')

interface Mapping {
  filename: string
  alt: string
}

const VIDEO_FILES: Mapping[] = [
  { filename: 'hero-bullet.mp4', alt: 'hero-bullet' },
  { filename: 'documents.mp4', alt: 'documents' },
  { filename: 'casings.mp4', alt: 'casings' },
  { filename: 'smoke.mp4', alt: 'smoke' },
  { filename: 'pistol-shots.mp4', alt: 'pistol-shots' },
  { filename: 'ar15-shots.mp4', alt: 'ar15-shots' },
  { filename: 'sniper2.mp4', alt: 'sniper2' },
  { filename: 'wireframe.mp4', alt: 'wireframe' },
  { filename: 'sniper-scope.mp4', alt: 'sniper-scope' },
]

async function uploadAll(): Promise<void> {
  const payload = await getPayload({ config })

  // Wipe existing media (idempotent re-run)
  await payload.delete({ collection: 'media', where: {} })

  const idByAlt: Record<string, number> = {}

  for (const v of VIDEO_FILES) {
    const filePath = path.join(VIDEOS_DIR, v.filename)
    const created = await payload.create({
      collection: 'media',
      data: { alt: v.alt },
      filePath,
    })
    idByAlt[v.alt] = created.id as number
    payload.logger.info(`✓ uploaded ${v.filename} → media#${created.id}`)
  }

  // ── Globals
  await payload.updateGlobal({
    slug: 'hero',
    data: { video: idByAlt['hero-bullet'] },
  })
  await payload.updateGlobal({
    slug: 'about',
    data: { video: idByAlt['documents'] },
  })
  await payload.updateGlobal({
    slug: 'wireframe',
    data: { video: idByAlt['wireframe'] },
  })
  await payload.updateGlobal({
    slug: 'green-tactics',
    data: { video: idByAlt['sniper-scope'] },
  })

  // ── Trainings (collection) — match by `order`
  const trainingVideoByOrder: Record<number, string> = {
    1: 'casings',
    2: 'smoke',
    3: 'pistol-shots',
    4: 'ar15-shots',
    5: 'sniper2',
  }
  const trainings = await payload.find({ collection: 'trainings', limit: 100 })
  for (const t of trainings.docs) {
    const alt = trainingVideoByOrder[t.order]
    if (!alt) continue
    await payload.update({
      collection: 'trainings',
      id: t.id,
      data: { video: idByAlt[alt] },
    })
  }

  payload.logger.info('✓ media seed complete; relations updated')
}

try {
  await uploadAll()
  process.exit(0)
} catch (err) {
  console.error('media seed failed:', err)
  process.exit(1)
}
