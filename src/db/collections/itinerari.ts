import { type CollectionConfig, type Field } from 'payload'

import { F, Section, Tab } from '@/db/_partials'

import { isCmsUser } from '../access'
import { CollectionGroup } from '../utils'

//

export const Itinerari: CollectionConfig = {
	slug: 'itinerari',

	labels: {
		singular: 'Itinerario',
		plural: 'Itinerari',
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
					fields: [...Section.generale(), ...informazioniTecniche()],
				},

				Tab.descrizione(),
				Tab.servizi(),

				{
					label: 'Contenuti collegati',
					fields: [
						{
							name: 'luoghi',
							type: 'relationship',
							relationTo: 'luoghi',
							hasMany: true,
						},
						{
							name: 'persone',
							type: 'relationship',
							relationTo: 'persone',
							hasMany: true,
						},
					],
				},

				Tab.multimedia([
					F.video({ name: 'video', label: 'Video' }),
					{
						name: 'geolocalized_media',
						label: 'Media geolocalizzati',
						type: 'array',
						fields: [
							{ name: 'position', type: 'point', required: true },
							F.media({ name: 'image', label: 'Immagine', required: true }),
						],
					},
				]),
			],
		},
	],
}

function informazioniTecniche(): Field[] {
	return [
		F.header('Informazioni tecniche'),
		F.row([
			{
				name: 'length',
				label: 'Lunghezza itinerario',
				type: 'text',
			},
			{
				name: 'duration',
				label: 'Durata',
				type: 'text',
			},
		]),
		F.row([
			{
				name: 'elevation',
				label: 'Dislivello',
				type: 'text',
			},
			{
				name: 'type',
				label: 'Tipo di itinerario',
				type: 'select',
				options: [
					{
						label: 'Itinerario ad anello',
						value: 'loop',
					},
					{
						label: 'Andata e ritorno',
						value: 'out_and_back',
					},
				],
			},
		]),
		F.row([
			{
				name: 'difficulty',
				label: 'Difficoltà',
				type: 'select',
				options: [
					{
						label: 'T - Turistico',
						value: 'touristic',
					},
					{
						label: 'E - Escursionistico',
						value: 'hiking',
					},
					{
						label: 'EE - Escursionisti Esperti',
						value: 'expert_hiking',
					},
				],
			},
			F.upload({ name: 'gpx_track', label: 'Tracciato GPX', collection: 'tracciati' }),
		]),
	]
}
