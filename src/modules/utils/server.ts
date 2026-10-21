import { notFound } from 'next/navigation'
import { DataFromCollectionSlug, PaginatedDocs } from 'payload'

import type { MainCollection } from '@/modules/brand'
import { getCachedDocumentBySlug } from '@/modules/cache'
import { getAppLocale } from '@/modules/i18n'

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

//

type GetBySlugResult<C extends MainCollection> = {
	record: DataFromCollectionSlug<C>
	locale: string
}

export async function getRecordBySlug<C extends MainCollection>(
	collection: C,
	slug: string,
): Promise<GetBySlugResult<C>> {
	const locale = await getAppLocale()
	const record = await getCachedDocumentBySlug(collection, slug, locale)
	if (!record) return notFound()

	return {
		record,
		locale,
	}
}
