import { hash } from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findCustomerByEmail, updateCustomerPassword } from '@/lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token || password.length < 8) {
      return NextResponse.json({ error: 'Invalid token or password too short' }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const email = resetToken.email
    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    try {
      const customer = await findCustomerByEmail(email)
      if (customer) {
        await updateCustomerPassword(customer.id, password)
      }
    } catch (wooError) {
      console.error('Failed to update WooCommerce password:', wooError)
    }

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    const message = error instanceof Error ? error.message : 'Failed to reset password'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
