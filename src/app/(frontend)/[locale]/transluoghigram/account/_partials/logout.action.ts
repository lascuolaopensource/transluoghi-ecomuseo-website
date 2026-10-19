'use server'

import { getLocale } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { createLocalReq, logoutOperation } from 'payload'

import { socialAccountNextCookie } from '@/db/auth-cookies'
import { readSocialAccountUser } from '@/db/social-account-session'
import { redirect } from '@/modules/i18n'
import { getDb } from '@/modules/utils/server'

//

export async function logout(_: FormData) {
	const payload = await getDb()
	const user = await readSocialAccountUser({
		headers: await headers(),
		payload,
	})
	if (user) {
		const req = await createLocalReq({ user }, payload)
		await logoutOperation({
			collection: payload.collections['social-account'],
			req,
		})
	}

	const auth = payload.collections['social-account'].config.auth
	const cookie = socialAccountNextCookie(auth, payload.config.cookiePrefix, '', new Date(0))
	const store = await cookies()
	store.set(cookie.name, cookie.value, cookie.options)

	redirect({
		href: `/transluoghigram/login`,
		locale: await getLocale(),
	})
}
