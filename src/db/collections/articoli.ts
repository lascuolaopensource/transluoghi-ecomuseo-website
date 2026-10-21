import { CollectionConfig } from 'payload'

import { F, Section, Tab } from '@/db/_partials'
import { mainCollectionRevalidateHooks } from '@/modules/cache'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

const revalidate = mainCollectionRevalidateHooks('articoli')

export const Articoli: CollectionConfig<'articoli'> = {
	slug: 'articoli',

	labels: {
		singular: 'Articolo',
		plural: 'Articoli',
	},

	admin: {
		useAsTitle: F.name.name,
		defaultColumns: [F.name.name],
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
						...Section.generale([
							{
								name: 'subtitle',
								type: 'text',
								label: 'Sottotitolo',
								localized: true,
							},
						]),

						F.header('Informazioni generali'),
						F.row([
							F.date({ name: 'date', label: 'Data pubblicazione' }),
							{
								name: 'tag',
								label: 'Tag',
								type: 'select',
								options: [
									{
										value: 'evento',
										label: 'Evento',
									},
									{
										value: 'notizia',
										label: 'Notizia',
									},
									{
										value: 'reportage',
										label: 'Reportage',
									},
									{
										value: 'comunicato-stampa',
										label: 'Comunicato stampa',
									},
								],
							},
						]),
					],
				},

				{
					label: 'Contenuto',
					fields: [F.richText({ name: 'contents', label: 'Contenuto', required: true })],
				},

				Tab.multimedia(),
			],
		},
	],
}
