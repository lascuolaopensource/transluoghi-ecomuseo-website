import type { CollectionConfig } from 'payload'

import { authCookies } from '@/db/auth-cookies'

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
	},
	auth: {
		cookies: authCookies,
	},
	fields: [],
}
