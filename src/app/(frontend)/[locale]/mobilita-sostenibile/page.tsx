import type { PageWithLocaleProps } from '@/modules/utils/server'

import { getCachedGlobal } from '@/modules/cache'
import { SimplePage } from '@/modules/components/simple-page'
import { enableStaticLocale } from '@/modules/i18n'
import { generateGlobalMetadataFactory } from '@/modules/seo'

//

export const generateMetadata = generateGlobalMetadataFactory('mobilita-sostenibile')

export default async function MobilitaSostenibilePage(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	const mobilitaSostenibile = await getCachedGlobal('mobilita-sostenibile')

	return (
		<SimplePage
			cover={mobilitaSostenibile.copertina}
			richText={mobilitaSostenibile.description}
			gallery={mobilitaSostenibile.gallery}
		/>
	)
}
