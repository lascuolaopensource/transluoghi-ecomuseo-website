import { CollectionConfig } from 'payload'

import { F } from '@/db/_partials'
import {
	canChangeOwnResource,
	canCreateAsCmsOrSocial,
	stampOwnerBeforeValidate,
} from '@/db/owned-by-social-account'
import { CollectionGroup } from '@/db/utils'
import { revalidateSocialPost, revalidateSocialPostDelete } from '@/modules/cache'

//

export const SocialPost: CollectionConfig = {
	slug: 'social-post',

	labels: {
		singular: 'Post',
		plural: 'Posts',
	},

	admin: {
		useAsTitle: 'text',
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		create: canCreateAsCmsOrSocial,
		update: canChangeOwnResource,
		delete: canChangeOwnResource,
	},

	hooks: {
		afterChange: [revalidateSocialPost],
		afterDelete: [revalidateSocialPostDelete],
	},

	fields: [
		{
			name: 'text',
			type: 'text',
		},

		F.url({ name: 'link', label: 'Link' }),

		{
			name: 'media',
			type: 'upload',
			relationTo: 'social-media',
		},

		{
			name: 'owner',
			type: 'relationship',
			relationTo: 'social-account',
			required: true,
			hooks: {
				beforeValidate: [stampOwnerBeforeValidate],
			},
		},
	],
}
