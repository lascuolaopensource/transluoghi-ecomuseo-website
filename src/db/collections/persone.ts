import type { CollectionConfig } from 'payload'

import { F, Section, Tab } from '@/db/_partials'
import { mainCollectionRevalidateHooks } from '@/modules/cache'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

const revalidate = mainCollectionRevalidateHooks('persone')

export const Persone: CollectionConfig<'persone'> = {
	slug: 'persone',

	labels: {
		singular: 'Persona',
		plural: 'Persone',
	},

	admin: {
		defaultColumns: [F.name.name],
		useAsTitle: F.name.name,
		group: CollectionGroup.Principali,
	},

	access: {
		read: () => true,
		create: isCmsUser,
		update: isCmsUser,
		delete: isCmsUser,
	},

	hooks: {
		afterChange: [revalidate.afterChange],
		afterDelete: [revalidate.afterDelete],
	},

	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Dati',
					fields: [
						...Section.generale(),
						F.header('Info generali'),
						F.location(),
						F.contatti(),
						F.divider(),
						F.header('Itinerari correlati'),
						F.join({ name: 'itinerari', collection: 'itinerari', on: 'persone' }),
					],
				},
				Tab.descrizione(),
				Tab.multimedia(),
			],
		},
	],
}
