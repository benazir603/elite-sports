import { NextRequest, NextResponse } from 'next/server'
import { findCustomerByEmail } from '@/lib/woocommerce'
import { generateToken } from '@/lib/password-reset'

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const customer = await findCustomerByEmail(email.trim())

    if (customer) {
      const token = generateToken(customer.email)
      const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(customer.email)}`

      const resendKey = process.env.RESEND_API_KEY
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@elitesports.in'

      if (resendKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: customer.email,
            subject: 'Reset your Elite Sports password',
            html: `<p>Hi,</p><p>You requested a password reset. Click the link below to set a new password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
          }),
        })

        if (!res.ok) {
          console.error('Resend error:', await res.text())
        }
      } else {
        console.log('Password reset link (add RESEND_API_KEY to send for real):', resetUrl)
      }
    }

    return NextResponse.json({
      success: 'If the email exists, a password reset link has been sent.',
    })
  } catch (err: any) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
