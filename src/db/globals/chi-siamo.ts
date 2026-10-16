import type { GlobalConfig } from 'payload'

import { Tab } from '@/db/_partials'

import { isCmsUser } from '../access'

//

export const ChiSiamo: GlobalConfig = {
	slug: 'chi-siamo',
	label: 'Chi siamo',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	fields: [
		{
			type: 'tabs',
			tabs: [Tab.descrizione(), Tab.multimedia()],
		},
	],
}
