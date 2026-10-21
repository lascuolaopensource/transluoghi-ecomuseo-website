import { getLocale, setRequestLocale } from 'next-intl/server'

import type { Locale } from './types'

//

type LocaleParams = { locale: string }

/** Typed request locale for cached Payload reads (avoids `as Locale` at call sites). */
export async function getAppLocale(): Promise<Locale> {
	return (await getLocale()) as Locale
}

/**
 * Enables next-intl static rendering for a locale segment.
 * Pass either a locale string or the page/layout `params` promise.
 */
export async function enableStaticLocale(
	localeOrParams: string | Promise<LocaleParams>,
): Promise<Locale> {
	const locale = typeof localeOrParams === 'string' ? localeOrParams : (await localeOrParams).locale

	setRequestLocale(locale as Locale)
	return locale as Locale
}
