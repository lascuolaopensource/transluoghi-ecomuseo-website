import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { Payload } from 'payload'

import { readSocialAccountUser } from '@/db/social-account-session'
import { redirect } from '@/modules/i18n'
import { getRelation } from '@/modules/utils'
import { SocialAccount, SocialPost } from '@/payload-types'

//

export async function validateUser(payload: Payload) {
	const user = await readSocialAccountUser({
		headers: await headers(),
		payload,
	})

	if (!user || user.collection !== 'social-account') {
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
	const post = await payload.findByID({
		collection: 'social-post',
		id: postId,
	})

	if (getRelation(post.owner)?.id !== owner.id) {
		return new Error('Non sei il proprietario del post')
	}

	return post
}
