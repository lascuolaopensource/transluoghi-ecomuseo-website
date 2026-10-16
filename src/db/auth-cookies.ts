import type { IncomingAuthType } from 'payload'

// Shared by every auth collection so a later cookie name still inherits Secure.
export const authCookies: NonNullable<IncomingAuthType['cookies']> = {
	secure: process.env.NODE_ENV === 'production',
}
