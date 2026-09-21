import crypto from 'node:crypto'

const SECRET = process.env.RESET_TOKEN_SECRET

export function generateToken(email: string) {
  if (!SECRET) {
    throw new Error('RESET_TOKEN_SECRET is not set in .env.local')
  }

  const expires = Date.now() + 1000 * 60 * 30 // 30 minutes
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString('base64url')
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyToken(token: string): string | null {
  if (!SECRET) {
    throw new Error('RESET_TOKEN_SECRET is not set in .env.local')
  }

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null
    }
  } catch {
    return null
  }

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { email: string; expires: number }
  if (Date.now() > data.expires) return null

  return data.email
}
