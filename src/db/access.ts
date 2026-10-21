import type { Access, TypedUser } from 'payload'

//

type MaybeUser = TypedUser | null | undefined

export function hasCmsUser(user: MaybeUser): user is TypedUser & { collection: 'users' } {
	return user?.collection === 'users'
}

export function isSocialAccount(
	user: MaybeUser,
): user is TypedUser & { collection: 'social-account' } {
	return user?.collection == 'social-account'
}

export const isCmsUser: Access = ({ req: { user } }) => hasCmsUser(user)
