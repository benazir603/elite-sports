import { NextRequest, NextResponse } from 'next/server'
import { findCustomerByEmail, updateCustomerPassword } from '@/lib/woocommerce'
import { verifyToken } from '@/lib/password-reset'

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = (await req.json()) as {
      token?: string
      password?: string
      confirmPassword?: string
    }

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const email = verifyToken(token)
    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const customer = await findCustomerByEmail(email)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
    }

    await updateCustomerPassword(customer.id, password)

    return NextResponse.json({ success: 'Password updated successfully' })
  } catch (err: any) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: err.message || 'Could not reset password' }, { status: 500 })
  }
}
