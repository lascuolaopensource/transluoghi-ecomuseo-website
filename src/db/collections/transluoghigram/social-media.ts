import { open, stat } from 'node:fs/promises'
import { Access, CollectionConfig, ValidationError, type File } from 'payload'

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

export const socialMediaMaxBytes = 5_000_000

function ownerKey(owner: unknown) {
	if (typeof owner === 'object' && owner !== null && 'id' in owner) {
		return String(owner.id)
	}
	if (typeof owner === 'string' || typeof owner === 'number') {
		return String(owner)
	}
	return undefined
}

const canChangeOwnMedia: Access = ({ req: { user } }) => {
	if (user?.collection == 'users') return true
	if (user?.collection == 'social-account') {
		return {
			owner: {
				equals: user.id,
			},
		}
	}
	return false
}

export const SocialMedia = {
	slug: 'social-media',

	admin: {
		group: CollectionGroup.Transluoghigram,
	},

	access: {
		read: () => true,
		create: ({ req: { user } }) =>
			user?.collection == 'users' || user?.collection == 'social-account',
		update: canChangeOwnMedia,
		delete: canChangeOwnMedia,
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
				if ((operation == 'create' || operation == 'update') && req.file) {
					await assertSocialMediaFile(req.file)
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
				beforeValidate: [
					({ value, req, operation, previousValue }) => {
						if (req.user?.collection == 'users') {
							return value ?? previousValue
						} else if (req.user?.collection == 'social-account') {
							if (operation == 'update' && ownerKey(previousValue) !== String(req.user.id)) {
								throw new Error('Unexpected error')
							}
							return req.user.id
						} else if (req.payloadAPI === 'local') {
							return value
						} else {
							throw new Error('Unexpected error')
						}
					},
				],
			},
		},
	],
} satisfies CollectionConfig

async function assertSocialMediaFile(file: File) {
	if ((await byteLength(file)) > socialMediaMaxBytes) {
		throw new ValidationError({
			collection: 'social-media',
			errors: [{ message: 'File is too large.', path: 'file' }],
		})
	}

	const sniffed = sniffSocialMedia(await header(file))
	if (!sniffed) {
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
	if (file.data?.length) return file.data.subarray(0, 4096)
	if (!file.tempFilePath) return Buffer.alloc(0)

	const handle = await open(file.tempFilePath, 'r')
	try {
		const bytes = Buffer.alloc(4096)
		const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0)
		return bytes.subarray(0, bytesRead)
	} finally {
		await handle.close()
	}
}

function sniffSocialMedia(bytes: Buffer) {
	if (isJpeg(bytes)) return 'image/jpeg'
	if (isPng(bytes)) return 'image/png'
	if (isGif(bytes)) return 'image/gif'
	if (isWebp(bytes)) return 'image/webp'
	if (isMp4(bytes)) return 'video/mp4'
	if (isWebm(bytes)) return 'video/webm'
	return undefined
}

function isJpeg(bytes: Buffer) {
	return (
		bytes.length >= 4 &&
		bytes[0] == 0xff &&
		bytes[1] == 0xd8 &&
		bytes[2] == 0xff &&
		bytes[3] != 0xf7
	)
}

function isPng(bytes: Buffer) {
	return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
}

function isGif(bytes: Buffer) {
	const signature = bytes.subarray(0, 6).toString('ascii')
	return signature == 'GIF87a' || signature == 'GIF89a'
}

function isWebp(bytes: Buffer) {
	return (
		bytes.subarray(0, 4).toString('ascii') == 'RIFF' && bytes.subarray(8, 12).toString('ascii') == 'WEBP'
	)
}

function isMp4(bytes: Buffer) {
	if (bytes.subarray(4, 8).toString('ascii') != 'ftyp') return false
	if ((bytes[8]! & 0x60) == 0) return false

	const brand = bytes.subarray(8, 12).toString('latin1').replace('\0', ' ').trim()
	switch (brand) {
		case 'avif':
		case 'avis':
		case 'mif1':
		case 'msf1':
		case 'heic':
		case 'heix':
		case 'hevc':
		case 'hevx':
		case 'qt':
		case 'M4V':
		case 'M4VH':
		case 'M4VP':
		case 'M4B':
		case 'M4A':
		case 'F4A':
		case 'F4B':
		case 'crx':
			return false
		default:
			return !brand.startsWith('3g')
	}
}

function isWebm(bytes: Buffer) {
	if (bytes[0] != 0x1a || bytes[1] != 0x45 || bytes[2] != 0xdf || bytes[3] != 0xa3) return false
	return webmDocType(bytes) == 'webm'
}

function webmDocType(bytes: Buffer) {
	const root = readElement(bytes, 0)
	if (!root) return undefined

	let offset = root.next
	const end = Math.min(bytes.length, root.next + root.len)
	for (let count = 0; offset + 2 <= end && count < 32; count++) {
		const element = readElement(bytes, offset)
		if (!element || element.next + element.len < element.next) return undefined
		if (element.id == 0x4282) {
			return bytes
				.subarray(element.next, Math.min(bytes.length, element.next + element.len))
				.toString('ascii')
				.replace(/\0.*$/g, '')
		}
		if (element.next + element.len <= offset) return undefined
		offset = element.next + element.len
	}
	return undefined
}

function readElement(bytes: Buffer, offset: number) {
	const idField = readField(bytes, offset)
	if (!idField) return undefined
	const lengthField = readField(bytes, idField.next)
	if (!lengthField) return undefined

	const length = Buffer.from(lengthField.raw)
	length[0]! ^= 0x80 >> (length.length - 1)
	const nrLength = Math.min(6, length.length)
	return {
		id: uintBE(idField.raw),
		len: uintBE(length.subarray(length.length - nrLength)),
		next: lengthField.next,
	}
}

function readField(bytes: Buffer, offset: number) {
	if (offset >= bytes.length) return undefined
	const msb = bytes[offset]!
	let mask = 0x80
	let width = 1
	while ((msb & mask) == 0 && mask != 0) {
		width++
		mask >>= 1
	}
	if (mask == 0 || offset + width > bytes.length) return undefined
	return { raw: bytes.subarray(offset, offset + width), next: offset + width }
}

function uintBE(raw: Buffer) {
	let value = 0
	for (const byte of raw) value = value * 256 + byte
	return value
}
