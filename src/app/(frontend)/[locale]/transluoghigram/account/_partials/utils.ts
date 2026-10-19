import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { Forbidden, NotFound, Payload } from 'payload'

import { readSocialAccountUser } from '@/db/social-account-session'
import { redirect } from '@/modules/i18n'
import { getRelation } from '@/modules/utils'
import { SocialAccount, SocialPost } from '@/payload-types'

//

const ownershipError = () => new Error('Non sei il proprietario del post')

export async function validateUser(payload: Payload) {
	const user = await readSocialAccountUser({
		headers: await headers(),
		payload,
	})

	if (!user) {
		redirect({
			href: '/transluoghigram/login',
			locale: await getLocale(),
		})
		throw new Error('User not found')
	}

	return user
}

export async function getPostAndValidateOwner(
	payload: Payload,
	postId: string,
	owner: SocialAccount,
): Promise<SocialPost | Error> {
	try {
		const post = await payload.findByID({
			collection: 'social-post',
			id: postId,
			overrideAccess: false,
			user: owner,
		})

		if (getRelation(post.owner)?.id !== owner.id) {
			return ownershipError()
		}

		return post
	} catch (error) {
		if (error instanceof Forbidden || error instanceof NotFound) {
			return ownershipError()
		}
		throw error
	}
}
