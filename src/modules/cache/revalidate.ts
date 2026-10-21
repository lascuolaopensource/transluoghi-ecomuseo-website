import { revalidatePath, revalidateTag } from 'next/cache'
import type {
	CollectionAfterChangeHook,
	CollectionAfterDeleteHook,
	GlobalAfterChangeHook,
	Payload,
} from 'payload'

import type { MainCollection } from '@/modules/brand'

import {
	aboutPaths,
	collectionListPaths,
	collectionListTags,
	documentPaths,
	documentTags,
	globalTags,
	homePaths,
	localeLayoutPaths,
	mainCollectionListPaths,
	mobilitaPaths,
	socialFeedTag,
	transluoghigramPaths,
} from './tags'

//

type RevalidateContext = {
	disableRevalidate?: boolean
}

function shouldSkip(context: unknown): boolean {
	return Boolean((context as RevalidateContext | undefined)?.disableRevalidate)
}

function markTag(tag: string, payload?: Payload) {
	try {
		revalidateTag(tag, 'max')
	} catch (error) {
		payload?.logger.warn({
			msg: `revalidateTag skipped for "${tag}" (outside Next.js request?)`,
			err: error,
		})
	}
}

function markPath(path: string, type?: 'page' | 'layout', payload?: Payload) {
	try {
		if (type) revalidatePath(path, type)
		else revalidatePath(path)
	} catch (error) {
		payload?.logger.warn({
			msg: `revalidatePath skipped for "${path}" (outside Next.js request?)`,
			err: error,
		})
	}
}

function markTags(tags: string[], payload?: Payload) {
	for (const tag of tags) markTag(tag, payload)
}

function markPaths(paths: string[], payload?: Payload) {
	for (const path of paths) markPath(path, undefined, payload)
}

//

const HOME_EMBEDDED: MainCollection[] = ['luoghi', 'residenze', 'itinerari']

function revalidateMainDocument(args: {
	collection: MainCollection
	slug: string | null | undefined
	previousSlug?: string | null
	payload?: Payload
}) {
	const { collection, slug, previousSlug, payload } = args

	if (slug) {
		markTags(documentTags(collection, slug), payload)
		markPaths(documentPaths(collection, slug), payload)
	}

	if (previousSlug && previousSlug !== slug) {
		markTags(documentTags(collection, previousSlug), payload)
		markPaths(documentPaths(collection, previousSlug), payload)
	}

	markTags(collectionListTags(collection), payload)
	markPaths(collectionListPaths(collection), payload)

	if (HOME_EMBEDDED.includes(collection)) {
		markTags(globalTags('home'), payload)
		markPaths(homePaths(), payload)
	}
}

export function mainCollectionRevalidateHooks(collection: MainCollection): {
	afterChange: CollectionAfterChangeHook
	afterDelete: CollectionAfterDeleteHook
} {
	const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
		if (shouldSkip(req.context)) return doc

		const slug = typeof doc?.slug === 'string' ? doc.slug : undefined
		const previousSlug = typeof previousDoc?.slug === 'string' ? previousDoc.slug : undefined

		revalidateMainDocument({
			collection,
			slug,
			previousSlug,
			payload: req.payload,
		})

		return doc
	}

	const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
		if (shouldSkip(req.context)) return doc

		const slug = typeof doc?.slug === 'string' ? doc.slug : undefined
		revalidateMainDocument({ collection, slug, payload: req.payload })
		return doc
	}

	return { afterChange, afterDelete }
}

export const revalidateSocialPost: CollectionAfterChangeHook = ({ doc, req }) => {
	if (shouldSkip(req.context)) return doc
	markTag(socialFeedTag(), req.payload)
	markPaths(transluoghigramPaths(), req.payload)
	return doc
}

export const revalidateSocialPostDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
	if (shouldSkip(req.context)) return doc
	markTag(socialFeedTag(), req.payload)
	markPaths(transluoghigramPaths(), req.payload)
	return doc
}

//

type GlobalRevalidateConfig = {
	slug: string
	paths?: string[]
	layoutPaths?: boolean
}

function revalidateGlobal(config: GlobalRevalidateConfig, payload?: Payload) {
	markTags(globalTags(config.slug), payload)

	if (config.paths) markPaths(config.paths, payload)

	if (config.layoutPaths) {
		for (const { path, type } of localeLayoutPaths()) {
			markPath(path, type, payload)
		}
	}
}

export function globalRevalidateHook(config: GlobalRevalidateConfig): GlobalAfterChangeHook {
	return ({ doc, req }) => {
		if (shouldSkip(req.context)) return doc
		revalidateGlobal(config, req.payload)
		return doc
	}
}

export const revalidateHome = globalRevalidateHook({
	slug: 'home',
	paths: homePaths(),
})

export const revalidateChiSiamo = globalRevalidateHook({
	slug: 'chi-siamo',
	paths: aboutPaths(),
})

export const revalidateMobilita = globalRevalidateHook({
	slug: 'mobilita-sostenibile',
	paths: mobilitaPaths(),
})

export const revalidateFooter = globalRevalidateHook({
	slug: 'footer',
	layoutPaths: true,
})

export const revalidateTesti = globalRevalidateHook({
	slug: 'testi',
	paths: mainCollectionListPaths(),
})
