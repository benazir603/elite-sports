import crypto from 'node:crypto'
import { compare, hash } from 'bcrypt'
import NextAuth, { CredentialsSignin } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { findCustomerByEmail, createCustomer, sanitizeWooUsername } from '@/lib/woocommerce'

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL?.replace(/\/$/, '')

async function getWooCustomerId(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<number | undefined> {
  try {
    const existing = await findCustomerByEmail(email)
    if (existing) return existing.id
    const username = sanitizeWooUsername(email.split('@')[0], crypto.randomUUID().slice(0, 8))
    const newCustomer = await createCustomer({
      email,
      first_name: firstName || email.split('@')[0],
      last_name: lastName || '',
      username,
      password: crypto.randomBytes(32).toString('base64url'),
    })
    return newCustomer.id
  } catch (error) {
    console.error('Failed to link WooCommerce customer:', error)
    return undefined
  }
}

class EmailNotVerified extends CredentialsSignin {
  code = 'email_not_verified'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null

        const valid = await compare(password, user.password)
        if (!valid) return null

        if (!user.emailVerified) throw new EmailNotVerified()

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          wooCustomerId: user.wooCustomerId,
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        const wooId = await getWooCustomerId(
          user.email,
          (profile as any)?.given_name,
          (profile as any)?.family_name
        )
        ;(user as any).wooCustomerId = wooId
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        token.wooCustomerId = (user as any).wooCustomerId
      }
      if (trigger === 'update' && session?.wooCustomerId) {
        token.wooCustomerId = session.wooCustomerId
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).wooCustomerId = token.wooCustomerId
      }
      return session
    },
  },
})

export { hash }
