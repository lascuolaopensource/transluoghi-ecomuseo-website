import { setRequestLocale } from 'next-intl/server'

import type { Locale } from './types'

export function enableStaticLocale(locale: string) {
	setRequestLocale(locale as Locale)
	return locale as Locale
}
