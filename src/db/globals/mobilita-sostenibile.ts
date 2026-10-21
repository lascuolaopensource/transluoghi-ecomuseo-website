import type { GlobalConfig } from 'payload'

import { Tab } from '@/db/_partials'
import { revalidateMobilita } from '@/modules/cache'

import { isCmsUser } from '../access'

//

export const MobilitaSostenibile: GlobalConfig = {
	slug: 'mobilita-sostenibile',
	label: 'Mobilità sostenibile',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	hooks: {
		afterChange: [revalidateMobilita],
	},

	fields: [
		{
			type: 'tabs',
			tabs: [Tab.descrizione(), Tab.multimedia()],
		},
	],
}
