'use server'

import { zfd } from 'zod-form-data'
import z from 'zod/v4'

import { SocialMedia, socialMediaMaxBytes } from '@/db/collections/transluoghigram/social-media'
import { DatabaseKey } from '@/modules/utils'
import { getDb } from '@/modules/utils/server'

import { FormAction } from '../../_forms/types'
import { validateUser } from './utils'

//

const schema = zfd.formData({
	text: zfd.text(),
	link: zfd.text(z.nullish(z.url())),
	media: zfd.file(z.nullish(z.file().mime(SocialMedia.upload.mimeTypes).max(socialMediaMaxBytes))),
})

export type CreatePostData = z.infer<typeof schema>

export const createPost: FormAction = async (_, data) => {
	const db = await getDb()
	const user = await validateUser(db)

	const validatedFields = schema.safeParse(data)
	if (!validatedFields.success) return { type: 'error', message: 'Dati non validi' }

	const { text, link, media } = validatedFields.data

	try {
		let mediaId: DatabaseKey | undefined
		if (media) {
			const socialMedia = await db.create({
				collection: 'social-media',
				data: {
					owner: user.id,
				},
				file: {
					data: Buffer.from(await media.arrayBuffer()),
					mimetype: media.type,
					name: media.name,
					size: media.size,
				},
				overrideAccess: false,
				user,
			})
			mediaId = socialMedia.id
		}

		await db.create({
			collection: 'social-post',
			data: {
				text,
				link,
				media: mediaId,
				owner: user.id,
			},
			overrideAccess: false,
			user,
		})
	} catch (error) {
		console.error(error)
		return { type: 'error', message: 'Operazione non riuscita' }
	}

	return { type: 'success' }
}
