import { Access, CollectionConfig } from 'payload'

import { hasCmsUser, isSocialAccount } from '@/db/access'
import { authCookies } from '@/db/auth-cookies'
import {
	socialAccountCookieStrategy,
	socialAccountFirstRegisterEndpoint,
	socialAccountForgotPasswordEndpoint,
	socialAccountLoginEndpoint,
	socialAccountLogoutEndpoint,
	socialAccountRefreshEndpoint,
	socialAccountResetPasswordEndpoint,
} from '@/db/social-account-session'
import { CollectionGroup } from '@/db/utils'

//

const canChangeOwnAccount: Access = ({ req: { user } }) => {
	if (hasCmsUser(user)) return true
	if (isSocialAccount(user)) {
		return {
			id: {
				equals: user.id,
			},
		}
	}
	return false
}

export const SocialAccount: CollectionConfig = {
	slug: 'social-account',

	labels: {
		singular: 'Account',
		plural: 'Accounts',
	},

	admin: {
		useAsTitle: 'name',
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		admin: () => false,
		create: ({ req: { user } }) => hasCmsUser(user),
		update: canChangeOwnAccount,
		delete: canChangeOwnAccount,
		unlock: canChangeOwnAccount,
	},
	auth: {
		cookies: authCookies,
		removeTokenFromResponses: true,
		strategies: [socialAccountCookieStrategy],
	},
	endpoints: [
		socialAccountFirstRegisterEndpoint,
		socialAccountForgotPasswordEndpoint,
		socialAccountLoginEndpoint,
		socialAccountLogoutEndpoint,
		socialAccountRefreshEndpoint,
		socialAccountResetPasswordEndpoint,
	],

	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
		},
		{
			name: 'email',
			type: 'email',
			access: {
				read: ({ req: { user }, id }) => {
					if (hasCmsUser(user)) return true
					return isSocialAccount(user) && String(user.id) === String(id)
				},
			},
		},
		{
			name: 'persona',
			type: 'relationship',
			relationTo: 'persone',
		},
	],
}
