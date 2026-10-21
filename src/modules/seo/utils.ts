import type { Metadata } from 'next'

import { GlobalSlug } from 'payload'

import type { Home, Media } from '@/payload-types'

import { getCachedGlobal } from '@/modules/cache'
import { getAppLocale } from '@/modules/i18n'

import { MainCollection } from '../brand'
import { brandText } from '../brand/text'
import { getRelation } from '../utils'
import { getDb, getRecordBySlug, PageWithSlugProps } from '../utils/server'
import { generateUrl } from './functions'
import { getServerSideURL } from './get-url'
import { defaultOpenGraph, mergeOpenGraph } from './merge-open-graph'

//

type WithMeta = { meta?: Home['meta'] }

export function generateCollectionMetadataFactory<C extends MainCollection>(collection: C) {
	return async function (props: PageWithSlugProps): Promise<Metadata> {
		const { slug } = await props.params
		const record = await getRecordBySlug(collection, slug)
		return generateMeta({ doc: record })
	}
}

export function generateGlobalMetadataFactory<G extends GlobalSlug>(global: G) {
	return async function (): Promise<Metadata> {
		const record = await getCachedGlobal(global)
		return generateMeta({ doc: record as WithMeta })
	}
}

//

async function generateMeta(args: { doc: WithMeta | null | undefined }): Promise<Metadata> {
	const { doc } = args
	const locale = await getAppLocale()
	const payload = await getDb()

	const title = doc?.meta?.title ? doc?.meta?.title : brandText.title

	const media = getRelation(doc?.meta?.image)
	const ogImage = getImageURL(media)

	const url = await generateUrl({
		doc,
		collectionSlug: undefined,
		globalSlug: undefined,
		payload,
		locale,
	})

	const description = doc?.meta?.description || brandText.subtitle

	return {
		title,
		description,
		openGraph: mergeOpenGraph({
			url,
			title,
			description,
			images: ogImage
				? [
						{
							url: ogImage,
						},
					]
				: undefined,
		}),
	}
}

function getImageURL(image?: Media | null) {
	const serverUrl = getServerSideURL()

	let url = defaultOpenGraph.images[0].url

	if (image && typeof image === 'object' && 'url' in image) {
		const ogUrl = image.sizes?.og?.url
		url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
	}

	return url
}
