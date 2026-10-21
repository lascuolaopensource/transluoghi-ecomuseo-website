import { Locale, Messages } from '#/i18n'

//

declare module 'next-intl' {
	interface AppConfig {
		Locale: Locale
		Messages: Messages
	}
}
