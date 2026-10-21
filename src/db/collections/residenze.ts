import type { CollectionConfig, Field } from 'payload'

import type { Residenze as ResidenzaType } from '@/payload-types'

import { F, Section, Tab } from '@/db/_partials'
import { mainCollectionRevalidateHooks } from '@/modules/cache'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

const revalidate = mainCollectionRevalidateHooks('residenze')

export const Residenze: CollectionConfig<'residenze'> = {
	slug: 'residenze',

	labels: {
		singular: 'Residenza',
		plural: 'Residenze',
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
						F.row([
							F.date({ name: 'start_date', label: 'Data inizio', required: true }),
							F.date({ name: 'end_date', label: 'Data fine' }),
						]),

						...enrollmentsSection(),
					],
				},

				{
					label: 'Testi',
					fields: [
					{
						name: 'short_description',
						label: 'Descrizione breve',
						type: 'textarea',
						required: true,
						localized: true,
					},
						F.richText({ name: 'description', label: 'Descrizione' }),
					],
				},

				{
					label: 'Programma',
					fields: [
						F.array({
							name: 'program',
							fieldForRowLabel: 'step_name',
							fields: [
								{
									name: 'step_name',
									label: 'Giorno / Momento',
									type: 'text',
									localized: true,
								},
								F.richText({ name: 'step_description', label: 'Descrizione' }),
							],
						}),
					],
				},

				{
					label: 'Persone coinvolte',
					fields: [
						F.array({
							name: 'people',
							label: 'Tutor, esperti e collaboratori',
							fieldForRowLabel: F.name.name,
							fields: [
								F.row([F.name, F.media({ name: 'foto', label: 'Foto' })]),
								{
									name: 'role',
									label: 'Ruolo',
									type: 'text',
									localized: true,
								},
								F.plainRichText({ name: 'bio', label: 'Breve biografia' }),
								F.links({
									name: 'organizations',
									label: 'Organizzazioni',
									localizedName: false,
								}),
							],
						}),
					],
				},

				{
					label: 'Racconto risultati',
					fields: [F.richText({ name: 'story', label: 'Racconto' })],
				},

				Tab.multimedia(),
			],
		},
	],
}

function enrollmentsSection(): Field[] {
	return [
		{ name: 'has_registration', type: 'checkbox', label: 'Ci si può iscrivere' },

		{
			label: 'Iscrizioni',
			type: 'group',
			admin: {
				hideGutter: true,
				condition: (_: unknown, siblingData: Partial<ResidenzaType>) =>
					Boolean(siblingData.has_registration),
			},
			fields: [
				F.row([
					F.date({
						name: 'registration_deadline',
						label: 'Scadenza iscrizioni',
						validate: (value, ctx) => {
							const residenza: Partial<ResidenzaType> = ctx.siblingData
							if (residenza.has_registration && !value) return 'La scadenza è obbligatoria'
							else return true
						},
					}),
					F.url({
						name: 'registration_url',
						label: 'Link iscrizioni',
						validate: (value, ctx) => {
							const residenza: Partial<ResidenzaType> = ctx.siblingData
							if (residenza.has_registration && !value) return 'Il link è obbligatorio'
							else return true
						},
					}),
				]),
				{
					name: 'registration_open',
					type: 'checkbox',
					label: 'Iscrizioni aperte',
				},
			],
		},
	]
}
