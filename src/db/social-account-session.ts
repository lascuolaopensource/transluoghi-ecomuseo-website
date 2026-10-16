import {
	APIError,
	JWTAuthentication,
	loginOperation,
	logoutOperation,
	type AuthStrategy,
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

export function hasAdminCredential(headers: Headers, cookiePrefix: string) {
	const authorization = headers.get('Authorization')
	if (authorization?.startsWith('JWT ') || authorization?.startsWith('Bearer ')) return true
	return Boolean(parseCookies(headers).get(`${cookiePrefix}-token`))
}

export async function readSocialAccountUser({ headers, payload, req }: ReadArgs): Promise<SocialAccount | null> {
	const cookiePrefix = payload.config.cookiePrefix
	const token = parseCookies(headers).get(socialAccountCookieName(cookiePrefix))
	if (!token) return null

	const spoofed = new Headers(headers)
	spoofed.set('Cookie', `${cookiePrefix}-token=${encodeURIComponent(token)}`)
	spoofed.set('DisableAutologin', 'true')

	const result = await JWTAuthentication({
		headers: spoofed,
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
		const headers = new Headers()
		if (result.token) {
			headers.set(
				'Set-Cookie',
				socialAccountSessionCookie(collection.config.auth, req.payload.config.cookiePrefix, result.token),
			)
		}
		if (collection.config.auth.removeTokenFromResponses) delete result.token
		return Response.json(
			{
				message: req.t('authentication:passed'),
				...result,
			},
			{ headers, status: 200 },
		)
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
		return Response.json(
			{ message: req.t('authentication:logoutSuccessful') },
			{
				headers: new Headers({
					'Set-Cookie': socialAccountClearedCookie(collection.config.auth, req.payload.config.cookiePrefix),
				}),
				status: 200,
			},
		)
	},
}
