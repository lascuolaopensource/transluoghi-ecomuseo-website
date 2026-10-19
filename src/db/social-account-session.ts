import {
	APIError,
	JWTAuthentication,
	loginOperation,
	logoutOperation,
	refreshOperation,
	resetPasswordOperation,
	type AuthStrategy,
	type Collection,
	type Endpoint,
	type Payload,
	type PayloadRequest,
} from 'payload'
import { parseCookies } from 'payload/shared'

import {
	socialAccountClearedCookie,
	socialAccountCookieName,
	socialAccountSessionCookie,
} from '@/db/auth-cookies'
import type { SocialAccount } from '@/payload-types'

//

const socialAccountSlug = 'social-account' as const

type ReadArgs = {
	headers: Headers
	payload: Payload
	req?: PayloadRequest
}

type CollectionAuth = Collection['config']['auth']

export function hasAdminCredential(headers: Headers, cookiePrefix: string) {
	const authorization = headers.get('Authorization')
	if (authorization?.startsWith('JWT ') || authorization?.startsWith('Bearer ')) return true
	return Boolean(parseCookies(headers).get(`${cookiePrefix}-token`))
}

// extractJWT only checks the admin cookie. This cookie is read here, so the same csrf rule has to run first.
function csrfAllowsCookie(headers: Headers, csrf: string[]) {
	const origin = headers.get('Origin')
	if (origin) return csrf.length === 0 || csrf.includes(origin)
	if (csrf.length === 0) return true
	const secFetchSite = headers.get('Sec-Fetch-Site')
	return secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none'
}

export async function readSocialAccountUser({ headers, payload, req }: ReadArgs): Promise<SocialAccount | null> {
	const cookiePrefix = payload.config.cookiePrefix
	const token = parseCookies(headers).get(socialAccountCookieName(cookiePrefix))
	if (!token) return null
	if (!csrfAllowsCookie(headers, payload.config.csrf)) return null

	// JWTAuthentication only reads `${cookiePrefix}-token`; remap so the social token is visible under that name.
	const headersForJwtStrategy = new Headers(headers)
	headersForJwtStrategy.set('Cookie', `${cookiePrefix}-token=${encodeURIComponent(token)}`)
	headersForJwtStrategy.set('DisableAutologin', 'true')

	const result = await JWTAuthentication({
		headers: headersForJwtStrategy,
		payload,
		req,
		strategyName: 'social-account-cookie',
	})

	if (result.user?.collection !== socialAccountSlug) return null
	return result.user as SocialAccount
}

// Runs before the built-in JWT strategy. An admin token must win when both cookies exist.
export const socialAccountCookieStrategy: AuthStrategy = {
	name: 'social-account-cookie',
	authenticate: async ({ headers, payload, req }) => {
		if (hasAdminCredential(headers, payload.config.cookiePrefix)) return { user: null }
		if (!csrfAllowsCookie(headers, payload.config.csrf)) return { user: null }
		const user = await readSocialAccountUser({ headers, payload, req })
		return { user }
	},
}

function depthFrom(req: PayloadRequest) {
	const depth = req.searchParams?.get('depth')
	if (depth == null || depth.trim() === '') return undefined
	const number = Number(depth)
	if (Number.isNaN(number)) return undefined
	return number
}

/** Set social Set-Cookie when a token is present, optionally strip `token`, return JSON with message. */
function socialAuthJsonResponse({
	auth,
	cookiePrefix,
	message,
	result,
	token,
	status = 200,
}: {
	auth: CollectionAuth
	cookiePrefix: string
	message: string
	result: Record<string, unknown>
	token?: string | null
	status?: number
}) {
	const headers = new Headers()
	if (token) {
		headers.set('Set-Cookie', socialAccountSessionCookie(auth, cookiePrefix, token))
	}
	const body = { ...result }
	if (auth.removeTokenFromResponses) delete body.token
	return Response.json({ message, ...body }, { headers, status })
}

function socialAuthClearedCookieResponse(message: string, auth: CollectionAuth, cookiePrefix: string) {
	return Response.json(
		{ message },
		{
			headers: new Headers({
				'Set-Cookie': socialAccountClearedCookie(auth, cookiePrefix),
			}),
			status: 200,
		},
	)
}

// Payload's first-register runs with overrideAccess when the collection is empty and
// Set-Cookies payload-token. Social accounts are CMS-created only — block the bootstrap.
export const socialAccountFirstRegisterEndpoint: Endpoint = {
	path: '/first-register',
	method: 'post',
	handler: () => {
		throw new APIError('Forbidden', 403)
	},
}

export const socialAccountLoginEndpoint: Endpoint = {
	path: '/login',
	method: 'post',
	handler: async (req) => {
		const collection = req.payload.collections[socialAccountSlug]
		const result = await loginOperation({
			collection,
			data: {
				email: typeof req.data?.email === 'string' ? req.data.email : '',
				password: typeof req.data?.password === 'string' ? req.data.password : '',
			},
			depth: depthFrom(req),
			req,
		})
		return socialAuthJsonResponse({
			auth: collection.config.auth,
			cookiePrefix: req.payload.config.cookiePrefix,
			message: req.t('authentication:passed'),
			result: { ...result },
			token: result.token,
		})
	},
}

export const socialAccountLogoutEndpoint: Endpoint = {
	path: '/logout',
	method: 'post',
	handler: async (req) => {
		const collection = req.payload.collections[socialAccountSlug]
		const user = await readSocialAccountUser({
			headers: req.headers,
			payload: req.payload,
			req,
		})
		if (!user) throw new APIError('No User', 400)

		req.user = user
		const result = await logoutOperation({
			allSessions: req.searchParams?.get('allSessions') === 'true',
			collection,
			req,
		})
		if (!result) {
			return Response.json({ message: req.t('error:logoutFailed') }, { status: 400 })
		}
		return socialAuthClearedCookieResponse(
			req.t('authentication:logoutSuccessful'),
			collection.config.auth,
			req.payload.config.cookiePrefix,
		)
	},
}

// Payload's refresh and reset-password handlers always Set-Cookie payload-token.
// These keep the social session on its own cookie, the same as login and logout.
export const socialAccountRefreshEndpoint: Endpoint = {
	path: '/refresh-token',
	method: 'post',
	handler: async (req) => {
		const collection = req.payload.collections[socialAccountSlug]
		const user = await readSocialAccountUser({
			headers: req.headers,
			payload: req.payload,
			req,
		})
		if (!user) throw new APIError('No User', 403)

		req.user = user
		const result = await refreshOperation({
			collection,
			req,
		})
		const { refreshedToken, ...resultWithoutToken } = result
		const body = collection.config.auth.removeTokenFromResponses
			? resultWithoutToken
			: { ...resultWithoutToken, refreshedToken }
		return socialAuthJsonResponse({
			auth: collection.config.auth,
			cookiePrefix: req.payload.config.cookiePrefix,
			message: req.t('authentication:tokenRefreshSuccessful'),
			result: body,
			token: result.setCookie && refreshedToken ? refreshedToken : undefined,
		})
	},
}

export const socialAccountResetPasswordEndpoint: Endpoint = {
	path: '/reset-password',
	method: 'post',
	handler: async (req) => {
		const collection = req.payload.collections[socialAccountSlug]
		const result = await resetPasswordOperation({
			collection,
			data: {
				password: typeof req.data?.password === 'string' ? req.data.password : '',
				token: typeof req.data?.token === 'string' ? req.data.token : '',
			},
			depth: depthFrom(req),
			req,
		})
		return socialAuthJsonResponse({
			auth: collection.config.auth,
			cookiePrefix: req.payload.config.cookiePrefix,
			message: req.t('authentication:passwordResetSuccessfully'),
			result: { ...result },
			token: result.token,
		})
	},
}
