import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { generateCollectionStaticParams } from '@/modules/cache'
import { CollectionPageHeading } from '@/modules/components/collection-page-heading'
import { Container } from '@/modules/components/container'
import { Copertina } from '@/modules/components/copertina'
import { Gallery } from '@/modules/components/gallery'
import { RichText } from '@/modules/components/richtext'
import { Badge } from '@/modules/components/shadcn/components/ui/badge'
import { T } from '@/modules/components/t'
import { generateCollectionMetadataFactory } from '@/modules/seo'
import { formatDate } from '@/modules/utils'
import { getRecordBySlug, getSlug, PageWithSlugProps } from '@/modules/utils/server'

//

export const generateStaticParams = () => generateCollectionStaticParams('articoli')

export const generateMetadata = generateCollectionMetadataFactory('articoli')

export default async function ArticoloPage(props: PageWithSlugProps) {
	enableStaticLocale((await props.params).locale)

	const slug = await getSlug(props)
	const { record: articolo } = await getRecordBySlug('articoli', slug)

	const t = await getTranslations('articoli')
	const tTags = await getTranslations('tags')

	return (
		<>
			<Copertina copertina={articolo.copertina} collection="articoli" />
			<CollectionPageHeading
				collection="articoli"
				title={articolo.name}
				backButton={{
					href: '/articoli',
					children: t('backButton'),
				}}
			>
				<T tag="h3" className="-mt-2 text-white">
					{articolo.subtitle}
				</T>

				<div className="flex gap-2 items-center">
					{articolo.date && (
						<span className="text-sm font-semibold">{formatDate(articolo.date)}</span>
					)}
					{articolo.date && articolo.tag && <span>|</span>}
					{articolo.tag && <Badge>{tTags(articolo.tag)}</Badge>}
				</div>
			</CollectionPageHeading>

			<Container className="max-w-prose">
				<RichText data={articolo.contents} />
			</Container>

			<Gallery items={articolo.gallery} collection="articoli" />
		</>
	)
}
