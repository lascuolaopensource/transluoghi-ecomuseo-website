import { MAIN_COLLECTIONS, type MainCollection } from '@/modules/brand'
import { routing } from '@/modules/i18n/routing'

//

export const APP_LOCALES = routing.locales

export function documentTag(collection: string, slug: string, locale: string): string {
	return `${collection}_${slug}_${locale}`
}

export function collectionListTag(collection: string, locale: string): string {
	return `${collection}_list_${locale}`
}

export function globalTag(slug: string, locale: string): string {
	return `global_${slug}_${locale}`
}

export function socialFeedTag(): string {
	return 'social-post_feed'
}

export function documentTags(collection: string, slug: string): string[] {
	return APP_LOCALES.map((locale) => documentTag(collection, slug, locale))
}

export function collectionListTags(collection: string): string[] {
	return APP_LOCALES.map((locale) => collectionListTag(collection, locale))
}

export function globalTags(slug: string): string[] {
	return APP_LOCALES.map((locale) => globalTag(slug, locale))
}

/** Public paths for a main-collection document (slug is shared across locales). */
export function documentPaths(collection: MainCollection, slug: string): string[] {
	return APP_LOCALES.map((locale) => `/${locale}/${collection}/${slug}`)
}

export function collectionListPaths(collection: MainCollection): string[] {
	return APP_LOCALES.map((locale) => `/${locale}/${collection}`)
}

/** List routes for every main collection (e.g. after global `testi` changes). */
export function mainCollectionListPaths(): string[] {
	return MAIN_COLLECTIONS.flatMap((collection) => collectionListPaths(collection))
}

export function homePaths(): string[] {
	return APP_LOCALES.map((locale) => `/${locale}`)
}

export function aboutPaths(): string[] {
	return APP_LOCALES.map((locale) => `/${locale}/about`)
}

export function mobilitaPaths(): string[] {
	return APP_LOCALES.map((locale) => `/${locale}/mobilita-sostenibile`)
}

export function transluoghigramPaths(): string[] {
	return APP_LOCALES.map((locale) => `/${locale}/transluoghigram`)
}

export function localeLayoutPaths(): Array<{ path: string; type: 'layout' }> {
	return APP_LOCALES.map((locale) => ({ path: `/${locale}`, type: 'layout' as const }))
}
