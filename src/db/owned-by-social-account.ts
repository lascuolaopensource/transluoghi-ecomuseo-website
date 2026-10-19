import type { Access, FieldHook } from 'payload'

import { hasCmsUser, isSocialAccount } from '@/db/access'

//

function ownerKey(owner: unknown) {
	if (typeof owner === 'object' && owner !== null && 'id' in owner) {
		return String(owner.id)
	}
	if (typeof owner === 'string' || typeof owner === 'number') {
		return String(owner)
	}
	return undefined
}

/** CMS users: full access. Social accounts: only rows they own via `owner`. */
export const canChangeOwnResource: Access = ({ req: { user } }) => {
	if (hasCmsUser(user)) return true
	if (isSocialAccount(user)) {
		return {
			owner: {
				equals: user.id,
			},
		}
	}
	return false
}

export const canCreateAsCmsOrSocial: Access = ({ req: { user } }) =>
	hasCmsUser(user) || isSocialAccount(user)

/** Stamp `owner` to the caller; block stealing on update; keep local-API values. */
export const stampOwnerBeforeValidate: FieldHook = ({ value, req, operation, previousValue }) => {
	if (hasCmsUser(req.user)) {
		return value ?? previousValue
	} else if (isSocialAccount(req.user)) {
		if (operation == 'update' && ownerKey(previousValue) !== String(req.user.id)) {
			throw new Error('Unauthorized')
		}
		return req.user.id
	} else if (req.payloadAPI === 'local') {
		return value
	} else {
		throw new Error('Unauthorized')
	}
}
