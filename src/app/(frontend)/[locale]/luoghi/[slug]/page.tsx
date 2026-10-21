import { CollectionPageHeading } from '#/components/collection-page-heading'
import { Container } from '#/components/container'
import { Copertina } from '#/components/copertina'
import { Gallery } from '#/components/gallery'
import { Map } from '#/components/map/map'
import { RichText } from '#/components/richtext'
import { ServicesSection } from '#/components/services-section'
import { getRecordBySlug, getSlug, PageWithSlugProps } from '#/utils/server'
import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { generateCollectionStaticParams } from '@/modules/cache'
import { ContactsSection } from '@/modules/components/contacts-section'
import { InfoSection } from '@/modules/components/info-section'
import { generateCollectionMetadataFactory } from '@/modules/seo'
import { Luoghi } from '@/payload-types'

//

export const generateStaticParams = () => generateCollectionStaticParams('luoghi')

export const generateMetadata = generateCollectionMetadataFactory('luoghi')

export default async function Itinerario(pageProps: PageWithSlugProps) {
	await enableStaticLocale(pageProps.params)

	const slug = await getSlug(pageProps)
	const { record: luogo } = await getRecordBySlug('luoghi', slug)

	const t = await getTranslations('luoghi')

	return (
		<>
			<Copertina copertina={luogo.copertina} collection="luoghi" />

			<CollectionPageHeading
				collection="luoghi"
				title={luogo.name}
				backButton={{
					href: '/luoghi',
					children: t('backButton'),
				}}
				rightContent={
					luogo.coordinates ? (
						<Map initialPosition={luogo.coordinates} showInitialPosition initialZoom={15} />
					) : null
				}
			/>

			<Container className="max-w-prose space-y-8">
				<RichText data={luogo.description} className="prose-h1:text-luoghi" />
				<ServicesSection services={luogo.services} collection="luoghi" />
				<LuogoInfoSection luogo={luogo} />
			</Container>

			<Gallery items={luogo.gallery} collection="luoghi" />
		</>
	)
}

// TODO - Add related itinerari and people

//

async function LuogoInfoSection(props: { luogo: Luoghi }) {
	const { luogo } = props
	const t = await getTranslations('common')

	const hasContacts = luogo.contacts && luogo.contacts.length > 0

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
			<ContactsSection contacts={luogo.contacts} collection="luoghi" />

			<InfoSection
				collection="luoghi"
				title={t('opening_hours')}
				text={luogo.timetable}
				className={{ 'col-span-2': !hasContacts }}
			/>
		</div>
	)
}
