'use server'

import { zfd } from 'zod-form-data'
import z from 'zod/v4'

import { getDb } from '@/modules/utils/server'

import { FormAction } from '../../_forms/types'
import { getPostAndValidateOwner, validateUser } from './utils'

//

const schema = zfd.formData({
	id: zfd.text(),
})

export type DeletePostData = z.infer<typeof schema>

export const deletePost: FormAction = async (_, data) => {
	const db = await getDb()
	const user = await validateUser(db)

	const validatedFields = schema.safeParse(data)
	if (!validatedFields.success) return { type: 'error', message: 'Dati non validi' }

	const { id } = validatedFields.data

	try {
		const result = await getPostAndValidateOwner(db, id, user)
		if (result instanceof Error) return { type: 'error', message: result.message }

		await db.delete({
			collection: 'social-post',
			id,
			overrideAccess: false,
			user,
		})
	} catch (error) {
		console.error(error)
		return { type: 'error', message: 'Operazione non riuscita' }
	}

	return { type: 'success' }
}
