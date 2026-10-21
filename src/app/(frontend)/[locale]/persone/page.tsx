import { enableStaticLocale } from '@/modules/i18n'

import { CollectionGridPage } from '@/modules/components/collection-grid-page'
import type { PageWithLocaleProps } from '@/modules/utils/server'

//

export default async function Page(props: PageWithLocaleProps) {
	enableStaticLocale((await props.params).locale)

	return <CollectionGridPage collection="persone" />
}
