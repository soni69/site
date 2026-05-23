export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Pre-initialize Payload (runs DB schema push) before any requests are handled.
    // Without this, the first /admin request would fail with "no such table" because
    // the SQLite push happens asynchronously inside the first request handler.
    const { getPayload } = await import('@/lib/payload')
    await getPayload()
  }
}
