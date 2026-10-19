import { open, stat } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'
import { CollectionConfig, ValidationError, type File, type PayloadRequest } from 'payload'

import { hasCmsUser, isSocialAccount } from '@/db/access'
import { canChangeOwnResource, canCreateAsCmsOrSocial, stampOwnerBeforeValidate } from '@/db/owned-by-social-account'
import { CollectionGroup, imageSizes } from '../../utils'

//

const socialMediaMimeTypes = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'video/mp4',
	'video/webm',
] as const

const allowedSocialMediaMimeTypes = new Set<string>(socialMediaMimeTypes)

export const socialMediaMaxBytes = 5_000_000

// file-type needs a few KB of the start of the file for container formats.
const sniffBytes = 4100

export const SocialMedia = {
	slug: 'social-media',

	admin: {
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		create: canCreateAsCmsOrSocial,
		update: canChangeOwnResource,
		delete: canChangeOwnResource,
	},

	upload: {
		adminThumbnail: 'thumbnail',
		imageSizes,
		formatOptions: { format: 'webp' },
		mimeTypes: [...socialMediaMimeTypes],
		// Seeded images are remote URLs and have no file body.
		filesRequiredOnCreate: false,
		staticDir: 'data/social-media',
	},

	hooks: {
		beforeOperation: [
			async ({ operation, req }) => {
				if (operation != 'create' && operation != 'update') return

				if (req.file) {
					await assertSocialMediaFile(req.file)
					return
				}

				// filesRequiredOnCreate is false for seed remote URLs. Without a body, REST/local
				// callers could otherwise set url + mimeType and skip sniffing — require a real
				// upload for social sessions; CMS and non-social local (seed) may use remote URLs.
				if (operation == 'create' && !canCreateSocialMediaWithoutFile(req)) {
					throw new ValidationError({
						collection: 'social-media',
						errors: [{ message: 'File is required.', path: 'file' }],
					})
				}
			},
		],
	},

	fields: [
		{
			name: 'owner',
			type: 'relationship',
			relationTo: 'social-account',
			hooks: {
				beforeValidate: [stampOwnerBeforeValidate],
			},
		},
	],
} satisfies CollectionConfig

function canCreateSocialMediaWithoutFile(req: PayloadRequest) {
	if (hasCmsUser(req.user)) return true
	if (req.payloadAPI === 'local' && !isSocialAccount(req.user)) return true
	return false
}

async function assertSocialMediaFile(file: File) {
	if ((await byteLength(file)) > socialMediaMaxBytes) {
		throw new ValidationError({
			collection: 'social-media',
			errors: [{ message: 'File is too large.', path: 'file' }],
		})
	}

	const detected = await fileTypeFromBuffer(await header(file))
	if (!detected || !allowedSocialMediaMimeTypes.has(detected.mime)) {
		throw new ValidationError({
			collection: 'social-media',
			errors: [{ message: 'File type is not allowed.', path: 'file' }],
		})
	}
}

async function byteLength(file: File) {
	let length = file.size ?? 0
	if (file.data?.length) length = Math.max(length, file.data.length)
	if (file.tempFilePath && (!file.data || file.data.length == 0)) {
		length = Math.max(length, (await stat(file.tempFilePath)).size)
	}
	return length
}

async function header(file: File) {
	if (file.data?.length) return file.data.subarray(0, sniffBytes)
	if (!file.tempFilePath) return Buffer.alloc(0)

	const handle = await open(file.tempFilePath, 'r')
	try {
		const bytes = Buffer.alloc(sniffBytes)
		const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0)
		return bytes.subarray(0, bytesRead)
	} finally {
		await handle.close()
	}
}
