import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { generateCollectionStaticParams } from '@/modules/cache'
import { Button } from '@/modules/components/button'
import { CollectionPageHeading } from '@/modules/components/collection-page-heading'
import { Container } from '@/modules/components/container'
import { Copertina } from '@/modules/components/copertina'
import { Gallery } from '@/modules/components/gallery'
import { Map } from '@/modules/components/map/map'
import { RichText } from '@/modules/components/richtext'
import { ServicesSection } from '@/modules/components/services-section'
import { Video } from '@/modules/components/video'
import { generateCollectionMetadataFactory } from '@/modules/seo'
import { getRelation } from '@/modules/utils'
import { getRecordBySlug, getSlug, PageWithSlugProps } from '@/modules/utils/server'

import { ItinerarioDetailCards } from './_partials'

//

export const generateStaticParams = () => generateCollectionStaticParams('itinerari')

export const generateMetadata = generateCollectionMetadataFactory('itinerari')

export default async function Itinerario(pageProps: PageWithSlugProps) {
	enableStaticLocale((await pageProps.params).locale)

	const slug = await getSlug(pageProps)
	const { record: itinerario } = await getRecordBySlug('itinerari', slug)

	const t = await getTranslations('itineraries')

	const gpxTrack = getRelation(itinerario.gpx_track)?.url

	return (
		<>
			<Copertina copertina={itinerario.copertina} collection="itinerari" />

			<CollectionPageHeading
				collection="itinerari"
				title={itinerario.name}
				backButton={{
					href: '/itinerari',
					children: t('backButton'),
				}}
				rightContent={
					<Map gpxTracks={[gpxTrack]}>
						<div className="absolute bottom-0 right-0 p-2 px-4 w-full">
							<Button
								href={gpxTrack ?? ''}
								download
								target="_blank"
								className="bg-black text-white w-full"
							>
								{t('download_gpx')}
							</Button>
						</div>
					</Map>
				}
			>
				<ItinerarioDetailCards itinerario={itinerario} />
			</CollectionPageHeading>

			<Container className="max-w-prose space-y-8">
				<Video video={itinerario.video} />
				<RichText data={itinerario.description} className="prose-h1:text-itinerari" />
				<ServicesSection services={itinerario.services} collection="itinerari" />
			</Container>

			<Gallery items={itinerario.gallery} collection="itinerari">
				<Map gpxTracks={[gpxTrack]}></Map>
			</Gallery>
		</>
	)
}

// TODO - Add media geolocalizzati

//   {/* TODO - Review this section */}
//   {/* Content below the two columns */}
//   {/* <div className="">
//   {itinerario?.persone && itinerario?.persone.length > 0 && (
//     <div className="">
//       <h2 className="font-bold text-xl text-center pb-4">{peopleTitle}</h2>
//       <CardGrid items={itinerario?.persone as Persone[]} category="persone" singleRow />
//     </div>
//   )}

//   {itinerario?.luoghi && itinerario?.luoghi.length > 0 && (
//     <div className="">
//       <h2 className="font-bold pt-4 text-xl text-center pb-4">{placesTitle}</h2>
//       <CardGrid items={itinerario?.luoghi as Luoghi[]} category="luoghi" singleRow />
//     </div>
//   )}
// </div> */}
