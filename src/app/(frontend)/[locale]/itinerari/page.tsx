import type { PageWithLocaleProps } from '@/modules/utils/server'

import { CollectionGridPage } from '@/modules/components/collection-grid-page'
import { enableStaticLocale } from '@/modules/i18n'

//

export default async function Page(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	return <CollectionGridPage collection="itinerari" />
}
