import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { generateCollectionStaticParams } from '@/modules/cache'
import { CollectionPageHeading } from '@/modules/components/collection-page-heading'
import { Container } from '@/modules/components/container'
import { Copertina } from '@/modules/components/copertina'
import { Gallery } from '@/modules/components/gallery'
import { InfoSection } from '@/modules/components/info-section'
import { RichText } from '@/modules/components/richtext'
import { T } from '@/modules/components/t'
import { generateCollectionMetadataFactory } from '@/modules/seo'
import { formatDate } from '@/modules/utils'
import { getRecordBySlug, getSlug, PageWithSlugProps } from '@/modules/utils/server'

import { InfoResidenza } from './_partials/info-residenza'
import { PersoneSection } from './_partials/persone-section'
import { ProgrammaSection } from './_partials/programma-section'

//

export const generateStaticParams = () => generateCollectionStaticParams('residenze')

export const generateMetadata = generateCollectionMetadataFactory('residenze')

export default async function ResidenzaSlug(props: PageWithSlugProps) {
	enableStaticLocale((await props.params).locale)

	const slug = await getSlug(props)
	const { record: residenza } = await getRecordBySlug('residenze', slug)
	const t = await getTranslations('residenze')

	const startDate = formatDate(residenza.start_date)
	const endDate = residenza.end_date ? formatDate(residenza.end_date) : undefined

	return (
		<div>
			<Copertina copertina={residenza.copertina} collection="residenze" />
			<CollectionPageHeading
				title={residenza.name}
				collection="residenze"
				backButton={{
					href: '/residenze',
					children: t('backButton'),
				}}
				rightContent={<InfoResidenza residenza={residenza} />}
			>
				<T tag="h3" className="text-white -mt-2">
					{residenza.short_description}
				</T>
				<div className="flex gap-2 items-center">
					<span>{startDate}</span>
					{endDate && (
						<>
							<ArrowRight size={16} className="-translate-y-px" />
							<span>{endDate}</span>
						</>
					)}
				</div>
			</CollectionPageHeading>

			<Container className="max-w-prose space-y-8">
				{residenza.description && (
					<InfoSection title={t('description')} collection="residenze">
						<RichText data={residenza.description} />
					</InfoSection>
				)}
				{residenza.story && (
					<InfoSection title={t('story')} collection="residenze">
						<RichText data={residenza.story} />
					</InfoSection>
				)}
				<ProgrammaSection program={residenza.program} />
				<PersoneSection people={residenza.people} />
			</Container>

			<Gallery items={residenza.gallery} collection="residenze" />
		</div>
	)
}
