import type { MainCollection } from '@/modules/brand'

import { getCachedCollectionSlugs } from './queries'

//

export async function generateCollectionStaticParams(collection: MainCollection) {
	const slugs = await getCachedCollectionSlugs(collection)
	return slugs.map((slug) => ({ slug }))
}
