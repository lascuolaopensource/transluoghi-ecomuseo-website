import { enableStaticLocale } from '@/modules/i18n'

import { getCachedGlobal } from '@/modules/cache'
import { SimplePage } from '@/modules/components/simple-page'
import { generateGlobalMetadataFactory } from '@/modules/seo'
import type { PageWithLocaleProps } from '@/modules/utils/server'

//

export const generateMetadata = generateGlobalMetadataFactory('chi-siamo')

export default async function AboutPage(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	const chiSiamo = await getCachedGlobal('chi-siamo')

	return (
		<SimplePage
			cover={chiSiamo.copertina}
			richText={chiSiamo.description}
			gallery={chiSiamo.gallery}
		/>
	)
}
