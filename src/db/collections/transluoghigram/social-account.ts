import { Access, CollectionConfig } from 'payload'

import { CollectionGroup } from '@/db/utils'

//

const canChangeOwnAccount: Access = ({ req: { user } }) => {
	if (user?.collection == 'users') return true
	if (user?.collection == 'social-account') {
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
		create: ({ req: { user } }) => user?.collection == 'users',
		update: canChangeOwnAccount,
		delete: canChangeOwnAccount,
		unlock: canChangeOwnAccount,
	},
	auth: true,

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
					if (user?.collection === 'users') return true
					return user?.collection === 'social-account' && String(user.id) === String(id)
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
