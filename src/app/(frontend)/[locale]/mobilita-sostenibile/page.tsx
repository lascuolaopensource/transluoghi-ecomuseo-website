import { enableStaticLocale } from '@/modules/i18n'

import { getCachedGlobal } from '@/modules/cache'
import { SimplePage } from '@/modules/components/simple-page'
import { generateGlobalMetadataFactory } from '@/modules/seo'
import type { PageWithLocaleProps } from '@/modules/utils/server'

//

export const generateMetadata = generateGlobalMetadataFactory('mobilita-sostenibile')

export default async function MobilitaSostenibilePage(props: PageWithLocaleProps) {
	const { locale: localeParam } = await props.params
	const locale = enableStaticLocale(localeParam)

	const mobilitaSostenibile = await getCachedGlobal('mobilita-sostenibile', locale)

	return (
		<SimplePage
			cover={mobilitaSostenibile.copertina}
			richText={mobilitaSostenibile.description}
			gallery={mobilitaSostenibile.gallery}
		/>
	)
}
