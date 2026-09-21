import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = (await req.json()) as {
      name?: string
      email?: string
      message?: string
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@elitesports.in'
    const toEmail = process.env.SUPPORT_EMAIL_TO || fromEmail

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          reply_to: email.trim(),
          subject: `Support message from ${name.trim()}`,
          html: `<p><strong>Name:</strong> ${name.trim()}</p><p><strong>Email:</strong> ${email.trim()}</p><p><strong>Message:</strong></p><p>${message.trim().replace(/\n/g, '<br/>')}</p>`,
        }),
      })

      if (!res.ok) {
        console.error('Resend error:', await res.text())
        return NextResponse.json({ error: 'Could not send email. Please try again later.' }, { status: 500 })
      }
    } else {
      console.log('Support message (add RESEND_API_KEY to send for real):', { name, email, message })
    }

    return NextResponse.json({ success: 'Your message has been sent.' })
  } catch (err: any) {
    console.error('Support API error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
