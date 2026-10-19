'use server'

import { zfd } from 'zod-form-data'
import z from 'zod/v4'

import { getDb } from '@/modules/utils/server'

import { FormAction } from '../../_forms/types'
import { getPostAndValidateOwner, validateUser } from './utils'

//

const schema = zfd.formData({
	text: zfd.text(),
	link: zfd.text(z.nullish(z.url())),
	id: zfd.text(),
})

export type EditPostData = z.infer<typeof schema>

export const editPost: FormAction = async (_, data) => {
	const db = await getDb()
	const user = await validateUser(db)

	const validatedFields = schema.safeParse(data)
	if (!validatedFields.success) return { type: 'error', message: 'Dati non validi' }

	const { text, link, id } = validatedFields.data

	try {
		const result = await getPostAndValidateOwner(db, id, user)
		if (result instanceof Error) return { type: 'error', message: result.message }

		await db.update({
			collection: 'social-post',
			id: id,
			data: {
				text,
				link,
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
