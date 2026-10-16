import type { CollectionConfig } from 'payload'

import { isCmsUser } from '../access'
import { CollectionGroup, videoMimeTypes } from '../utils'

//

export const Video: CollectionConfig = {
	slug: 'video',

	labels: {
		singular: 'Video',
		plural: 'Video',
	},

	admin: {
		group: CollectionGroup.Multimedia,
	},

	access: {
		read: () => true,
		create: isCmsUser,
		update: isCmsUser,
		delete: isCmsUser,
	},

	fields: [
		{
			name: 'alt',
			type: 'text',
			required: true,
			localized: true,
		},
	],

	upload: {
		mimeTypes: videoMimeTypes,
		staticDir: 'data/video',
	},
}
