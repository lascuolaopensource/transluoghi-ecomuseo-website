import { Access, CollectionConfig } from 'payload'

import { CollectionGroup, imageMimeTypes, imageSizes, videoMimeTypes } from '../../utils'

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

const canChangeOwnMedia: Access = ({ req: { user } }) => {
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

export const SocialMedia = {
	slug: 'social-media',

	admin: {
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		create: ({ req: { user } }) =>
			user?.collection == 'users' || user?.collection == 'social-account',
		update: canChangeOwnMedia,
		delete: canChangeOwnMedia,
	},

	upload: {
		adminThumbnail: 'thumbnail',
		imageSizes,
		formatOptions: { format: 'webp' },
		mimeTypes: [...imageMimeTypes, ...videoMimeTypes],
		staticDir: 'data/social-media',
	},

	fields: [
		{
			name: 'owner',
			type: 'relationship',
			relationTo: 'social-account',
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
} satisfies CollectionConfig
