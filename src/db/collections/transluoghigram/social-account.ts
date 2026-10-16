import { CollectionConfig } from 'payload'

import { CollectionGroup } from '@/db/utils'

//

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
