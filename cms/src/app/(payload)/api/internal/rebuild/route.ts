import { spawn } from 'node:child_process'
import { NextResponse } from 'next/server'

/**
 * Internal webhook for triggering an Astro frontend rebuild on the same
 * host as the CMS. Payload's `afterChange`/`afterDelete` hooks POST here
 * (debounced 2s, see src/hooks/triggerRebuild.ts) and we fire-and-forget
 * a detached shell script that pulls git + builds + rsyncs.
 *
 * Authorization: Bearer token must match REBUILD_TOKEN env var.
 *
 * Configuration:
 *   REBUILD_TOKEN   — shared secret with the webhook caller
 *   REBUILD_SCRIPT  — absolute path to the rebuild shell script
 *
 * Returns immediately so the hook caller doesn't block the admin save.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const expected = process.env.REBUILD_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const script = process.env.REBUILD_SCRIPT
  if (!script) {
    return NextResponse.json({ error: 'REBUILD_SCRIPT not configured' }, { status: 503 })
  }

  const child = spawn('/bin/bash', [script], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  })
  child.unref()

  return NextResponse.json({ ok: true, pid: child.pid })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ usage: 'POST with Authorization: Bearer <REBUILD_TOKEN>' })
}
