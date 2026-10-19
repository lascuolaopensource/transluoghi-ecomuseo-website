import type { Collection, IncomingAuthType } from 'payload'
import { generateCookie, getCookieExpiration } from 'payload/shared'

// Shared by every auth collection so a later cookie name still inherits Secure.
export const authCookies: NonNullable<IncomingAuthType['cookies']> = {
	secure: process.env.NODE_ENV === 'production',
}

type CollectionAuth = Collection['config']['auth']

export function socialAccountCookieName(cookiePrefix: string) {
	return `${cookiePrefix}-social-account-token`
}

function sameSite(auth: CollectionAuth): 'Lax' | 'None' | 'Strict' | undefined {
	if (typeof auth.cookies.sameSite === 'string') return auth.cookies.sameSite
	if (auth.cookies.sameSite) return 'Strict'
	return undefined
}

/** Shared name/domain/httpOnly/path/sameSite/secure for social-account cookies. */
function socialAccountCookieFields(auth: CollectionAuth, cookiePrefix: string) {
	return {
		name: socialAccountCookieName(cookiePrefix),
		domain: auth.cookies.domain || undefined,
		httpOnly: true as const,
		path: '/',
		sameSite: sameSite(auth),
		secure: auth.cookies.secure,
	}
}

function socialAccountCookieArgs(auth: CollectionAuth, cookiePrefix: string, value: string, expires: Date) {
	return {
		...socialAccountCookieFields(auth, cookiePrefix),
		expires,
		returnCookieAsObject: false as const,
		value,
	}
}

// Same flags as the admin cookie (including Secure from `authCookies`), different name.
export function socialAccountSessionCookie(auth: CollectionAuth, cookiePrefix: string, token: string) {
	return generateCookie<false>(
		socialAccountCookieArgs(
			auth,
			cookiePrefix,
			token,
			getCookieExpiration({ seconds: auth.tokenExpiration }),
		),
	)
}

export function socialAccountClearedCookie(auth: CollectionAuth, cookiePrefix: string) {
	return generateCookie<false>(
		socialAccountCookieArgs(auth, cookiePrefix, '', new Date(Date.now() - 1000)),
	)
}

export function socialAccountNextCookie(auth: CollectionAuth, cookiePrefix: string, token: string, expires: Date) {
	const fields = socialAccountCookieFields(auth, cookiePrefix)
	const site = fields.sameSite
	return {
		name: fields.name,
		value: token,
		options: {
			domain: fields.domain,
			expires,
			httpOnly: fields.httpOnly,
			path: fields.path,
			sameSite: site === 'None' ? ('none' as const) : site === 'Strict' ? ('strict' as const) : ('lax' as const),
			secure: fields.secure,
		},
	}
}
