'use server'

import { getLocale } from 'next-intl/server'
import { cookies } from 'next/headers'
import { createLocalReq, loginOperation } from 'payload'
import { getCookieExpiration } from 'payload/shared'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

import { socialAccountNextCookie } from '@/db/auth-cookies'
import { redirect } from '@/modules/i18n'
import { getDb } from '@/modules/utils/server'

import { FormAction } from '../_forms/types'

//

export const signup: FormAction = async (_, formData) => {
	const validatedFields = schema.safeParse(formData)
	if (!validatedFields.success) return { type: 'error', message: 'Dati non validi' }

	const { email, password } = validatedFields.data

	try {
		const payload = await getDb()
		const collection = payload.collections['social-account']
		// loginOperation keeps the token; payload.login strips it when removeTokenFromResponses is set.
		const result = await loginOperation({
			collection,
			data: { email, password },
			req: await createLocalReq({}, payload),
		})
		if (!result.token) return { type: 'error', message: 'Failed to signup' }

		const auth = collection.config.auth
		const cookie = socialAccountNextCookie(
			auth,
			payload.config.cookiePrefix,
			result.token,
			getCookieExpiration({ seconds: auth.tokenExpiration }),
		)
		const store = await cookies()
		store.set(cookie.name, cookie.value, cookie.options)
	} catch (e) {
		console.error(e)
		return { type: 'error', message: 'Failed to signup' }
	}

	redirect({
		href: `/transluoghigram/account`,
		locale: await getLocale(),
	})

	return { type: 'success' }
}

const schema = zfd.formData({
	email: zfd.text(z.email()),
	password: zfd.text(z.string().min(8).max(100)),
})

export type LoginData = z.infer<typeof schema>
