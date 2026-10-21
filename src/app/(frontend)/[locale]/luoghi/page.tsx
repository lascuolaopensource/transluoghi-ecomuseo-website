import { enableStaticLocale } from '@/modules/i18n'

import { CollectionGridPage } from '@/modules/components/collection-grid-page'
import type { PageWithLocaleProps } from '@/modules/utils/server'

//

export default async function Page(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	return <CollectionGridPage collection="luoghi" />
}
