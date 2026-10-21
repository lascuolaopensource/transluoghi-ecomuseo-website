import { unstable_cache } from 'next/cache'
import type {
	DataFromCollectionSlug,
	DataFromGlobalSlug,
	GlobalSlug,
	PaginatedDocs,
	TypedLocale,
} from 'payload'

import type { MainCollection } from '@/modules/brand'
import type { Locale } from '@/modules/i18n'
import { getDb } from '@/modules/utils/get-db'

import { collectionListTag, documentTag, globalTag, socialFeedTag } from './tags'

//

export async function getCachedGlobal<G extends GlobalSlug>(
	slug: G,
	locale: Locale,
	depth = 2,
): Promise<DataFromGlobalSlug<G>> {
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.findGlobal({
				slug,
				locale: locale as TypedLocale,
				depth,
				overrideAccess: false,
			})
		},
		['global', slug, locale, String(depth)],
		{ tags: [globalTag(slug, locale)] },
	)()
}

export async function getCachedDocumentBySlug<C extends MainCollection>(
	collection: C,
	slug: string,
	locale: Locale,
): Promise<DataFromCollectionSlug<C> | null> {
	return unstable_cache(
		async () => {
			const db = await getDb()
			const result = await db.find({
				collection,
				depth: 2,
				locale: locale as TypedLocale,
				limit: 1,
				pagination: false,
				overrideAccess: false,
				where: { slug: { equals: slug } },
			})
			return result.docs[0] ?? null
		},
		['document', collection, slug, locale],
		{ tags: [documentTag(collection, slug, locale)] },
	)()
}

export async function getCachedCollectionList<C extends MainCollection>(
	collection: C,
	locale: Locale,
	options?: { sort?: string },
): Promise<PaginatedDocs<DataFromCollectionSlug<C>>> {
	const sort = options?.sort ?? 'name'
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.find({
				collection,
				locale: locale as TypedLocale,
				sort,
				limit: 100,
				depth: 1,
				overrideAccess: false,
			})
		},
		['collection-list', collection, locale, sort],
		{ tags: [collectionListTag(collection, locale)] },
	)()
}

export async function getCachedHomeItinerariTracks(locale: Locale) {
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.find({
				collection: 'itinerari',
				locale: locale as TypedLocale,
				depth: 1,
				limit: 100,
				pagination: false,
				overrideAccess: false,
				select: {
					slug: true,
					gpx_track: true,
				},
			})
		},
		['home-itinerari-tracks', locale],
		{
			tags: [collectionListTag('itinerari', locale), globalTag('home', locale)],
		},
	)()
}

export async function getCachedSocialFeed(limit = 10) {
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.find({
				collection: 'social-post',
				sort: '-createdAt',
				depth: 2,
				limit,
				overrideAccess: false,
			})
		},
		['social-feed', String(limit)],
		{ tags: [socialFeedTag()] },
	)()
}

export async function getCachedCollectionSlugs(collection: MainCollection): Promise<string[]> {
	const db = await getDb()
	const { docs } = await db.find({
		collection,
		depth: 0,
		limit: 1000,
		pagination: false,
		overrideAccess: false,
		select: { slug: true },
	})

	return docs.map((doc) => doc.slug).filter((slug): slug is string => typeof slug === 'string')
}
