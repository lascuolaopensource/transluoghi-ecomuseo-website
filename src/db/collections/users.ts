import type { CollectionConfig } from 'payload'

import { isCmsUser } from '@/db/access'
import { authCookies } from '@/db/auth-cookies'

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
	},
	auth: {
		cookies: authCookies,
		removeTokenFromResponses: true,
	},
	access: {
		read: isCmsUser,
		create: isCmsUser,
		update: isCmsUser,
		delete: isCmsUser,
		unlock: isCmsUser,
	},
	fields: [],
}
