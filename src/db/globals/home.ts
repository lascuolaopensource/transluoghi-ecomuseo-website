import type { CollectionSlug, GlobalConfig, RelationshipField } from 'payload'

import * as F from '@/db/_partials/fields'

import { isCmsUser } from '../access'

//

export const Home: GlobalConfig<'home'> = {
	slug: 'home',
	label: 'Home',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	fields: [
		F.media({
			name: 'cover',
			label: 'Immagine di copertina',
			required: true,
		}),
		{
			name: 'statement',
			type: 'text',
			required: true,
			localized: true,
		},
		F.plainRichText({
			name: 'introduzione',
			label: 'Introduzione',
			required: true,
		}),
		{
			type: 'group',
			name: 'sections',
			label: 'Sezioni',
			admin: { hideGutter: true },
			required: true,
			fields: [
				F.titleAndDescription('itinerari', 'Itinerari'),
				F.titleAndDescription('luoghi', 'Luoghi', [homeRelationship('luoghi')]),
				F.titleAndDescription('residenze', 'Residenze', [homeRelationship('residenze')]),
			],
		},
	],
}

function homeRelationship(collection: CollectionSlug): RelationshipField {
	return {
		name: 'items',
		type: 'relationship',
		relationTo: collection,
		hasMany: true,
		minRows: 2,
		maxRows: 2,
		required: true,
	}
}
