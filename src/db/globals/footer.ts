import type { GlobalConfig } from 'payload'

import { F } from '@/db/_partials'

import { isCmsUser } from '../access'

//

export const Footer: GlobalConfig = {
	slug: 'footer',
	label: 'Footer',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	fields: [
		F.plainRichText({ name: 'text_left', label: 'Testo a sinistra' }),
		F.plainRichText({ name: 'text_right', label: 'Testo a destra' }),
		F.divider(),
		F.array({
			name: 'social_networks',
			label: 'Social networks',
			fieldForRowLabel: F.name.name,
			fields: [
				{ ...F.name, localized: false },
				F.url({ name: 'url', label: 'URL', required: true }),
			],
		}),
	],
}
