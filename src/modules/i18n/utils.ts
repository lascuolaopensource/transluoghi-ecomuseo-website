import { hasLocale as hasLocaleNextIntl } from 'next-intl'

import { routing } from './routing'

//

export function hasLocale(locale: string) {
	return hasLocaleNextIntl(routing.locales, locale)
}
