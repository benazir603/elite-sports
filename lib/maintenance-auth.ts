import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

export function requireMaintenanceAuth(request: Request) {
  const expectedKey = process.env.MAINTENANCE_API_KEY?.trim()
  if (!expectedKey || expectedKey.length < 32) {
    return NextResponse.json({ error: 'Maintenance API is disabled' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization') || ''
  const suppliedKey = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''

  if (!suppliedKey || !safeEqual(suppliedKey, expectedKey)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    )
  }

  return null
}
