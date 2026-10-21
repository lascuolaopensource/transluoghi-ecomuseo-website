import { getTranslations } from 'next-intl/server'

import type { PageWithLocaleProps } from '@/modules/utils/server'

import { getCachedCollectionList } from '@/modules/cache'
import { CollectionCard } from '@/modules/components/collection-card'
import { CollectionHeading } from '@/modules/components/collection-grid-heading'
import { Container } from '@/modules/components/container'
import { Grid } from '@/modules/components/grid'
import { MediaWithFallback } from '@/modules/components/media-with-fallback'
import { enableStaticLocale } from '@/modules/i18n'
import { formatDate } from '@/modules/utils'
import { Articoli } from '@/payload-types'

//

export default async function NewsPage(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	const articoli = await getCachedCollectionList('articoli', { sort: '-date' })

	return (
		<>
			<CollectionHeading collection="articoli" />

			<Container>
				<Grid>
					{articoli.docs.map((articolo) => (
						<CardArticolo key={articolo.id} articolo={articolo} />
					))}
				</Grid>
			</Container>
		</>
	)
}

//

type CardArticoloProps = {
	articolo: Articoli
}

async function CardArticolo(props: CardArticoloProps) {
	const { articolo } = props
	const t = await getTranslations('tags')

	return (
		<CollectionCard
			collection="articoli"
			record={articolo}
			content={(_) => (
				<div className="flex flex-col gap-2 p-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1">
							{articolo.tag && (
								<p
									key={articolo.tag}
									className="text-xs bg-black text-white px-2 py-1 rounded-full"
								>
									{t(articolo.tag)}
								</p>
							)}
						</div>
						{articolo.date && <p className="text-right font-medium">{formatDate(articolo.date)}</p>}
					</div>

					<MediaWithFallback
						media={articolo.copertina}
						className="h-[200px] rounded-md mb-2"
						noPlaceholderPulse
					/>

					<p className="text-xl font-semibold">{articolo.name}</p>
					<p className="text-sm">{articolo.subtitle}</p>
				</div>
			)}
		/>
	)
}
