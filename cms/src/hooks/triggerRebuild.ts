/**
 * Auto-rebuild webhook for the static Astro frontend.
 *
 * After any save/delete in a content collection or global, schedule a single
 * POST to `REBUILD_WEBHOOK_URL` (Vercel Deploy Hook, Netlify Build Hook,
 * GitHub `repository_dispatch`, etc.). Multiple writes within 2 s coalesce
 * into one rebuild so a bulk edit doesn't queue ten builds.
 *
 * In dev (Astro re-fetches Payload per request) this is a no-op as long as
 * REBUILD_WEBHOOK_URL is unset.
 */

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

const DEBOUNCE_MS = 2000

let pending: ReturnType<typeof setTimeout> | null = null
let pendingLabels = new Set<string>()

function scheduleRebuild(label: string, payload: Payload): void {
  const url = process.env.REBUILD_WEBHOOK_URL
  if (!url) return

  pendingLabels.add(label)
  if (pending) clearTimeout(pending)

  pending = setTimeout(async () => {
    const labels = Array.from(pendingLabels).join(', ')
    pendingLabels = new Set<string>()
    pending = null
    const method = process.env.REBUILD_WEBHOOK_METHOD || 'POST'
    const body = process.env.REBUILD_WEBHOOK_BODY // optional JSON body
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.REBUILD_WEBHOOK_AUTH) {
      headers['Authorization'] = process.env.REBUILD_WEBHOOK_AUTH
    }
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ?? (method === 'POST' ? JSON.stringify({ source: 'payload', labels }) : undefined),
      })
      if (res.ok) {
        payload.logger.info(`[rebuild] webhook fired (${labels}) → ${res.status}`)
      } else {
        const text = await res.text().catch(() => '')
        payload.logger.warn(`[rebuild] webhook ${res.status}: ${text.slice(0, 200)}`)
      }
    } catch (err) {
      payload.logger.error(
        `[rebuild] webhook failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }, DEBOUNCE_MS)
}

export const triggerRebuildAfterChange: CollectionAfterChangeHook = ({ req, doc, collection }) => {
  scheduleRebuild(`collection:${collection.slug}`, req.payload)
  return doc
}

export const triggerRebuildAfterDelete: CollectionAfterDeleteHook = ({ req, doc, collection }) => {
  scheduleRebuild(`collection:${collection.slug}:delete`, req.payload)
  return doc
}

export const triggerRebuildAfterGlobalChange: GlobalAfterChangeHook = ({ req, doc, global }) => {
  scheduleRebuild(`global:${global.slug}`, req.payload)
  return doc
}
