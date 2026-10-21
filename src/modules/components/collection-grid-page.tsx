import { getLocale } from 'next-intl/server'

import { MainCollection } from '@/modules/brand'
import { getCachedCollectionList } from '@/modules/cache'
import type { Locale } from '@/modules/i18n'

import { CollectionCard } from './collection-card'
import { CollectionHeading } from './collection-grid-heading'
import { Container } from './container'
import { Grid } from './grid'

//

type Props = {
	collection: MainCollection
}

export async function CollectionGridPage(props: Props) {
	const locale = (await getLocale()) as Locale
	const records = await getCachedCollectionList(props.collection, locale)

	return (
		<>
			<CollectionHeading collection={props.collection} />

			<Container className="py-12">
				<Grid>
					{records.docs.map((record) => (
						<CollectionCard key={record.id} record={record} collection={props.collection} />
					))}
				</Grid>
			</Container>
		</>
	)
}
