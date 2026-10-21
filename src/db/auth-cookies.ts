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

function socialAccountCookieInput(
	auth: CollectionAuth,
	cookiePrefix: string,
	value: string,
	expires: Date,
) {
	return {
		name: socialAccountCookieName(cookiePrefix),
		domain: auth.cookies.domain || undefined,
		expires,
		httpOnly: true as const,
		path: '/',
		sameSite: sameSite(auth),
		secure: auth.cookies.secure,
		value,
	}
}

// Same flags as the admin cookie (including Secure from `authCookies`), different name.
export function socialAccountSessionCookie(auth: CollectionAuth, cookiePrefix: string, token: string) {
	return generateCookie<false>({
		...socialAccountCookieInput(
			auth,
			cookiePrefix,
			token,
			getCookieExpiration({ seconds: auth.tokenExpiration }),
		),
		returnCookieAsObject: false,
	})
}

export function socialAccountClearedCookie(auth: CollectionAuth, cookiePrefix: string) {
	return generateCookie<false>({
		...socialAccountCookieInput(auth, cookiePrefix, '', new Date(Date.now() - 1000)),
		returnCookieAsObject: false,
	})
}

// Same shape Payload's setPayloadAuthCookie uses for Next cookies().set.
export function socialAccountNextCookie(
	auth: CollectionAuth,
	cookiePrefix: string,
	token: string,
	expires: Date,
) {
	const payloadCookie = generateCookie<true>({
		...socialAccountCookieInput(auth, cookiePrefix, token, expires),
		returnCookieAsObject: true,
	})
	const site =
		typeof payloadCookie.sameSite === 'string' ? payloadCookie.sameSite.toLowerCase() : 'lax'

	return {
		name: payloadCookie.name,
		value: payloadCookie.value ?? '',
		options: {
			domain: payloadCookie.domain,
			expires: payloadCookie.expires ? new Date(payloadCookie.expires) : expires,
			httpOnly: payloadCookie.httpOnly ?? true,
			path: payloadCookie.path ?? '/',
			sameSite: (site === 'none' || site === 'strict' || site === 'lax' ? site : 'lax') as
				| 'lax'
				| 'strict'
				| 'none',
			secure: Boolean(payloadCookie.secure),
		},
	}
}
