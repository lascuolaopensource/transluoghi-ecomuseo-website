import type { GlobalConfig } from 'payload'

import { Tab } from '@/db/_partials'
import { revalidateChiSiamo } from '@/modules/cache'

import { isCmsUser } from '../access'

//

export const ChiSiamo: GlobalConfig = {
	slug: 'chi-siamo',
	label: 'Chi siamo',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	hooks: {
		afterChange: [revalidateChiSiamo],
	},

	fields: [
		{
			type: 'tabs',
			tabs: [Tab.descrizione(), Tab.multimedia()],
		},
	],
}
