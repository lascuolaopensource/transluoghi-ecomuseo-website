import { notFound } from 'next/navigation'
import { DataFromCollectionSlug, PaginatedDocs } from 'payload'

import type { MainCollection } from '@/modules/brand'

import { getCachedDocumentBySlug } from '@/modules/cache'
import { enableStaticLocale } from '@/modules/i18n'

import { getDb } from './get-db'

export { getDb }

export function getOne<Docs extends PaginatedDocs>(docs: Docs): Docs['docs'][number] {
	const doc = docs.docs[0]
	if (!doc) return notFound()
	return doc
}

export interface PageProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

//

export interface PageWithSlugProps {
	params: Promise<{
		locale: string
		slug: string
	}>
}

export interface PageWithLocaleProps {
	params: Promise<{
		locale: string
	}>
}

export async function getSlug(pageProps: PageWithSlugProps): Promise<string> {
	return (await pageProps.params).slug
}

export async function getRecordBySlug<C extends MainCollection>(
	collection: C,
	slug: string,
): Promise<DataFromCollectionSlug<C>> {
	const record = await getCachedDocumentBySlug(collection, slug)
	if (!record) return notFound()
	return record
}

/** enableStaticLocale + load a main-collection doc for a slug page. */
export async function loadPageBySlug<C extends MainCollection>(
	collection: C,
	props: PageWithSlugProps,
): Promise<DataFromCollectionSlug<C>> {
	await enableStaticLocale(props.params)
	return getRecordBySlug(collection, await getSlug(props))
}
