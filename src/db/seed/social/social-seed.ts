import { faker } from '@faker-js/faker'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { Payload } from 'payload'

import { socialMediaMaxBytes } from '@/db/collections/transluoghigram/social-media'
import { getRandomItem } from '@/modules/utils'
import { getPaths } from '@/modules/utils/node'
import { getDb } from '@/modules/utils/server'
import { SocialAccount, SocialMedia } from '@/payload-types'

//

const { dirname } = getPaths(import.meta.url)

export async function seedSocial() {
	const payload = await getDb()

	payload.logger.info('Seeding social data...')

	const persone = await payload.find({
		collection: 'persone',
	})

	const accounts: SocialAccount[] = []
	for (let i = 0; i < 3; i++) {
		const account = await payload.create({
			collection: 'social-account',
			data: {
				name: faker.person.firstName(),
				persona: getRandomItem(persone.docs).id,
				email: `user${i}@example.com`,
				password: `user${i}@example.com`,
			},
		})
		accounts.push(account)
	}

	const videos = await createPostMediaFromDirectory(payload, path.resolve(dirname, 'videos'))

	const images: SocialMedia[] = []
	for (let i = 0; i < 10; i++) {
		const image = await generateMedia(payload)
		images.push(image)
	}

	//

	for (let i = 0; i < 30; i++) {
		const media = getRandomItem(getRandomItem([images, videos]))
		await payload.create({
			collection: 'social-post',
			data: {
				text: getRandomItem([undefined, faker.lorem.sentence()]),
				owner: getRandomItem(accounts).id,
				media: getRandomItem([media, media, media, media, media, undefined])?.id,
				link: getRandomItem([undefined, undefined, faker.internet.url()]),
			},
		})
	}

	payload.logger.info('Social data seeded successfully!')
}

await seedSocial()

//

//

export async function createPostMediaFromDirectory(
	payload: Payload,
	directoryPath: string,
): Promise<SocialMedia[]> {
	try {
		await stat(directoryPath)
	} catch (err: any) {
		if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
			return []
		}
		throw err
	}

	const files = await readdir(directoryPath)
	const gallery: SocialMedia[] = []

	for (const file of files) {
		const filePath = path.resolve(directoryPath, file)
		const fileStat = await stat(filePath)

		// Only process files, not directories. Larger videos stay on disk and are not seeded.
		if (fileStat.isFile()) {
			if (fileStat.size > socialMediaMaxBytes) continue

			const media = await payload.create({
				collection: 'social-media',
				data: {},
				filePath,
			})
			gallery.push(media)
		}
	}

	return gallery
}

async function generateMedia(payload: Payload): Promise<SocialMedia> {
	const width = 1200
	const height = 800
	const seed = faker.number.int()

	return await payload.create({
		collection: 'social-media',
		data: {
			url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
			filename: `image-${faker.string.uuid()}.jpg`,
			mimeType: 'image/jpeg',
			filesize: faker.number.int({ min: 100000, max: 1000000 }),
			width,
			height,
		},
	})
}
