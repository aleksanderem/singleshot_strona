/**
 * Payload Live Preview client for Astro.
 *
 * Payload posts messages of shape
 *   { type: 'payload-live-preview', data: <doc>, collectionSlug?: ..., globalSlug?: ... }
 * to this iframe on every field change in the editor (debounced by Payload).
 *
 * Strategy:
 *  1. Tagged elements (`data-pl="<slug>:<field.path>"`) get textContent
 *     patched live, no save needed.
 *  2. If an array's length changes (e.g. a new tag/feature/nav item is added
 *     or removed), the DOM can't represent that with patching alone — fall
 *     back to a debounced reload so Astro re-renders the section from API.
 *
 * Outside the admin iframe (production / direct browsing) this is a no-op.
 */
;(function () {
  if (typeof window === 'undefined') return
  if (window.parent === window) return

  /** Walk a dotted path on an object (with array indices). */
  function pluck(obj, path) {
    if (!obj || !path) return undefined
    return path.split('.').reduce((o, k) => {
      if (o == null) return undefined
      const idx = /^\d+$/.test(k) ? Number(k) : k
      return o[idx]
    }, obj)
  }

  let pendingReload = null
  function scheduleReload() {
    if (pendingReload) clearTimeout(pendingReload)
    pendingReload = setTimeout(() => window.location.reload(), 400)
  }

  /**
   * Inspect every `data-pl` tag rooted at this slug. Group those whose path
   * walks through an array index (e.g. `hero:title.0.text` and `hero:title.1.text`)
   * by the array path. Compare the number of distinct indices we have in the
   * DOM to the actual array length in the incoming data — if they disagree,
   * the structure has changed and we need to reload to get fresh markup.
   */
  function detectArrayLengthMismatch(slug, data) {
    const arrayPaths = new Map() // arrayPath -> Set<index>
    document.querySelectorAll(`[data-pl^="${slug}:"]`).forEach((el) => {
      const raw = el.getAttribute('data-pl') || ''
      const path = raw.slice(slug.length + 1)
      const m = path.match(/^([^.]+(?:\.[^.\d]+)*)\.(\d+)/)
      if (!m) return
      const arrayPath = m[1]
      const idx = Number(m[2])
      if (!arrayPaths.has(arrayPath)) arrayPaths.set(arrayPath, new Set())
      arrayPaths.get(arrayPath).add(idx)
    })
    for (const [arrayPath, indices] of arrayPaths) {
      const arr = pluck(data, arrayPath)
      if (Array.isArray(arr) && arr.length !== indices.size) return true
    }
    return false
  }

  function patchDom(slug, data) {
    const selector = `[data-pl^="${slug}:"]`
    document.querySelectorAll(selector).forEach((el) => {
      const raw = el.getAttribute('data-pl') || ''
      const path = raw.slice(slug.length + 1)
      const value = pluck(data, path)
      if (value == null) return
      if (typeof value === 'string' || typeof value === 'number') {
        el.textContent = String(value)
      }
    })
  }

  window.addEventListener('message', (event) => {
    const msg = event.data
    if (!msg || typeof msg !== 'object') return
    if (msg.type !== 'payload-live-preview' && msg.type !== 'livePreview') return

    const data = msg.data
    if (!data) return

    const slug =
      msg.globalSlug ||
      msg.collectionSlug ||
      msg.slug ||
      data.globalType ||
      data._collection ||
      undefined

    if (!slug) return

    if (detectArrayLengthMismatch(slug, data)) {
      scheduleReload()
      return
    }

    patchDom(slug, data)
  })
})()
