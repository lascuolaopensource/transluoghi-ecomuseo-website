import type {
	DataFromCollectionSlug,
	DataFromGlobalSlug,
	GlobalSlug,
	PaginatedDocs,
	TypedLocale,
} from 'payload'

import { unstable_cache } from 'next/cache'

import type { MainCollection } from '@/modules/brand'

import { getAppLocale, type Locale } from '@/modules/i18n'
import { getDb } from '@/modules/utils/get-db'

import { collectionListTag, documentTag, globalTag, socialFeedTag } from './tags'

//

async function localeOrDefault(locale?: Locale): Promise<Locale> {
	return locale ?? (await getAppLocale())
}

export async function getCachedGlobal<G extends GlobalSlug>(
	slug: G,
	locale?: Locale,
	depth = 2,
): Promise<DataFromGlobalSlug<G>> {
	const loc = await localeOrDefault(locale)
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.findGlobal({
				slug,
				locale: loc as TypedLocale,
				depth,
				overrideAccess: false,
			})
		},
		['global', slug, loc, String(depth)],
		{ tags: [globalTag(slug, loc)] },
	)()
}

export async function getCachedDocumentBySlug<C extends MainCollection>(
	collection: C,
	slug: string,
	locale?: Locale,
): Promise<DataFromCollectionSlug<C> | null> {
	const loc = await localeOrDefault(locale)
	return unstable_cache(
		async () => {
			const db = await getDb()
			const result = await db.find({
				collection,
				depth: 2,
				locale: loc as TypedLocale,
				limit: 1,
				pagination: false,
				overrideAccess: false,
				where: { slug: { equals: slug } },
			})
			return result.docs[0] ?? null
		},
		['document', collection, slug, loc],
		{ tags: [documentTag(collection, slug, loc)] },
	)()
}

export async function getCachedCollectionList<C extends MainCollection>(
	collection: C,
	options?: { sort?: string; locale?: Locale },
): Promise<PaginatedDocs<DataFromCollectionSlug<C>>> {
	const loc = await localeOrDefault(options?.locale)
	const sort = options?.sort ?? 'name'
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.find({
				collection,
				locale: loc as TypedLocale,
				sort,
				limit: 100,
				depth: 1,
				overrideAccess: false,
			})
		},
		['collection-list', collection, loc, sort],
		{ tags: [collectionListTag(collection, loc)] },
	)()
}

export async function getCachedHomeItinerariTracks(locale?: Locale) {
	const loc = await localeOrDefault(locale)
	return unstable_cache(
		async () => {
			const db = await getDb()
			return db.find({
				collection: 'itinerari',
				locale: loc as TypedLocale,
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
		['home-itinerari-tracks', loc],
		{
			tags: [collectionListTag('itinerari', loc), globalTag('home', loc)],
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
