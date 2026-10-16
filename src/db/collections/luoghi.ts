import type { CollectionConfig } from 'payload'

import { F, Section, Tab } from '@/db/_partials'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

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
