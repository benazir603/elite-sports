import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.emailVerified) {
      return NextResponse.json({ message: 'If an unverified account exists, a verification email has been sent.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await sendVerificationEmail(email, `${baseUrl}/verify-email?token=${token}`)

    return NextResponse.json({ message: 'If an unverified account exists, a verification email has been sent.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}
