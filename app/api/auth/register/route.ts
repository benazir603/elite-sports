import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from '@/auth'
import { prisma } from '@/lib/prisma'
import { findCustomerByEmail, createCustomer, sanitizeWooUsername } from '@/lib/woocommerce'
import { sendVerificationEmail } from '@/lib/email'

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const firstName = clean(body.firstName, 100)
    const lastName = clean(body.lastName, 100)
    const email = clean(body.email, 200).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    let wooCustomerId: number | undefined
    try {
      const wooExisting = await findCustomerByEmail(email)
      if (wooExisting) {
        wooCustomerId = wooExisting.id
      } else {
        const username = sanitizeWooUsername(email.split('@')[0], crypto.randomUUID().slice(0, 8))
        const newCustomer = await createCustomer({
          email,
          first_name: firstName,
          last_name: lastName,
          username,
          password,
        })
        wooCustomerId = newCustomer.id
      }
    } catch (wooError) {
      console.error('WooCommerce customer creation error:', wooError)
    }

    const hashedPassword = await hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`.trim(),
        password: hashedPassword,
        wooCustomerId,
      },
    })

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
    try {
      await sendVerificationEmail(email, `${baseUrl}/verify-email?token=${token}`)
    } catch (emailError) {
      console.error('Verification email error:', emailError)
      return NextResponse.json(
        { success: true, warning: 'Account created but verification email failed to send. Use resend on the login page.' }
      )
    }

    return NextResponse.json({ success: true, message: 'Account created. Check your email to verify your account.' })
  } catch (error) {
    console.error('Registration error:', error)
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
