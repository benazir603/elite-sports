import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const FROM_EMAIL = process.env.FROM_EMAIL || GMAIL_USER

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is not set')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Elite Sports" <${FROM_EMAIL}>`,
      to,
      subject: 'Reset your Elite Sports password',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset for your Elite Sports account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    })

    console.log('Reset email sent:', info.messageId)
  } catch (error: any) {
    console.error('Email error:', error.message || error)
    throw new Error('Failed to send reset email')
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is not set')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"Elite Sports" <${FROM_EMAIL}>`,
      to,
      subject: 'Verify your Elite Sports account',
      html: `
        <p>Hello,</p>
        <p>Thanks for creating an Elite Sports account.</p>
        <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>If you did not create this account, please ignore this email.</p>
      `,
    })

    console.log('Verification email sent:', info.messageId)
  } catch (error: any) {
    console.error('Email error:', error.message || error)
    throw new Error('Failed to send verification email')
  }
}
