import type { CollectionConfig } from 'payload'

import { F, Section, Tab } from '@/db/_partials'
import { mainCollectionRevalidateHooks } from '@/modules/cache'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

const revalidate = mainCollectionRevalidateHooks('luoghi')

export const Luoghi: CollectionConfig<'luoghi'> = {
	slug: 'luoghi',

	labels: {
		singular: 'Luogo',
		plural: 'Luoghi',
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
						F.header('Informazioni tecniche'),
						F.location(),
						F.plainRichText({ name: 'timetable', label: 'Orari di attività e date di chiusura' }),
						F.contatti(),
					],
				},

				Tab.descrizione(),
				Tab.servizi(),

				{
					label: 'Contenuti collegati',
					fields: [
						{
							name: 'persone',
							label: 'Persone',
							type: 'relationship',
							relationTo: 'persone',
							hasMany: true,
						},
						F.join({ name: 'itinerari', collection: 'itinerari', on: 'luoghi' }),
					],
				},

				Tab.multimedia(),
			],
		},
	],
}
