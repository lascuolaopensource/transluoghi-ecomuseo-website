import { CollectionPageHeading } from '#/components/collection-page-heading'
import { Container } from '#/components/container'
import { Copertina } from '#/components/copertina'
import { Gallery } from '#/components/gallery'
import { Map } from '#/components/map/map'
import { RichText } from '#/components/richtext'
import { getRecordBySlug, getSlug, PageWithSlugProps } from '#/utils/server'
import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { generateCollectionStaticParams } from '@/modules/cache'
import { ContactsSection } from '@/modules/components/contacts-section'
import { generateCollectionMetadataFactory } from '@/modules/seo'

//

export const generateStaticParams = () => generateCollectionStaticParams('persone')

export const generateMetadata = generateCollectionMetadataFactory('persone')

export default async function Persona(pageProps: PageWithSlugProps) {
	await enableStaticLocale(pageProps.params)

	const slug = await getSlug(pageProps)
	const { record: persona } = await getRecordBySlug('persone', slug)

	const t = await getTranslations('persone')

	return (
		<>
			<Copertina copertina={persona.copertina} collection="persone" />

			<CollectionPageHeading
				collection="persone"
				title={persona.name}
				backButton={{
					href: '/persone',
					children: t('backButton'),
				}}
				rightContent={
					persona.coordinates ? (
						<Map initialPosition={persona.coordinates} showInitialPosition initialZoom={15} />
					) : null
				}
			/>

			<Container className="max-w-prose space-y-8">
				<RichText data={persona.description} className="prose-h1:text-persone" />
				<ContactsSection contacts={persona.contacts} collection="persone" />
			</Container>

			<Gallery items={persona.gallery} collection="persone" />
		</>
	)
}

//

// TODO - Add related itinerari and luoghi
// TODO (Maybe) - Add tag "attività commerciale" / ...
