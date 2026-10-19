import type { CollectionConfig } from 'payload'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

export const Tracciati: CollectionConfig = {
	slug: 'tracciati',

	labels: {
		singular: 'Tracciato',
		plural: 'Tracciati',
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

	fields: [],

	upload: {
		staticDir: 'data/tracciati',
	},

	hooks: {
		beforeOperation: [
			({ req, operation }) => {
				if (operation === 'create' || operation === 'update') {
					const isGPX = req.file?.name.endsWith('.gpx')
					if (!isGPX) throw new Error('File must be a GPX file')
				}
			},
		],
	},
}
