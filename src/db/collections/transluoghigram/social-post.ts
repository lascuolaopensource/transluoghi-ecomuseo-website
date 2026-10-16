import { Access, CollectionConfig } from 'payload'

import { F } from '@/db/_partials'
import { CollectionGroup } from '@/db/utils'

//

function ownerKey(owner: unknown) {
	if (typeof owner === 'object' && owner !== null && 'id' in owner) {
		return String(owner.id)
	}
	if (typeof owner === 'string' || typeof owner === 'number') {
		return String(owner)
	}
	return undefined
}

const canChangeOwnPost: Access = ({ req: { user } }) => {
	if (user?.collection == 'users') return true
	if (user?.collection == 'social-account') {
		return {
			owner: {
				equals: user.id,
			},
		}
	}
	return false
}

export const SocialPost: CollectionConfig = {
	slug: 'social-post',

	labels: {
		singular: 'Post',
		plural: 'Posts',
	},

	admin: {
		useAsTitle: 'text',
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		create: ({ req: { user } }) =>
			user?.collection == 'users' || user?.collection == 'social-account',
		update: canChangeOwnPost,
		delete: canChangeOwnPost,
	},

	fields: [
		{
			name: 'text',
			type: 'text',
		},

		F.url({ name: 'link', label: 'Link' }),

		{
			name: 'media',
			type: 'upload',
			relationTo: 'social-media',
		},

		{
			name: 'owner',
			type: 'relationship',
			relationTo: 'social-account',
			required: true,
			hooks: {
				beforeValidate: [
					({ value, req, operation, previousValue }) => {
						if (req.user?.collection == 'users') {
							return value ?? previousValue
						} else if (req.user?.collection == 'social-account') {
							if (operation == 'update' && ownerKey(previousValue) !== String(req.user.id)) {
								throw new Error('Unexpected error')
							}
							return req.user.id
						} else if (req.payloadAPI === 'local') {
							return value
						} else {
							throw new Error('Unexpected error')
						}
					},
				],
			},
		},
	],
}
