import type { PageWithLocaleProps } from '@/modules/utils/server'

import { getCachedGlobal, getCachedHomeItinerariTracks } from '@/modules/cache'
import { Copertina } from '@/modules/components/copertina'
import GridOverlay from '@/modules/components/grid-overlay'
import { Map } from '@/modules/components/map/map'
import { RichText } from '@/modules/components/richtext'
import { enableStaticLocale } from '@/modules/i18n'
import { generateGlobalMetadataFactory } from '@/modules/seo'
import { getRelation, getRelations } from '@/modules/utils'

import { HomeSection } from './_partials/home-section'
import { RecordsDisplay } from './_partials/records-display'

//

export const generateMetadata = generateGlobalMetadataFactory('home')

//

export default async function Page(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	const home = await getCachedGlobal('home')
	const { itinerari: itinerariSection, luoghi, residenze } = home.sections

	const itinerari = await getCachedHomeItinerariTracks()

	const tracciati = itinerari.docs
		.map((i) => getRelation(i.gpx_track)?.url)
		.filter((v) => typeof v == 'string')

	return (
		<>
			<Copertina copertina={home.cover} title={home.statement} overlay={true}>
				<GridOverlay targetSquareSize={16} bottomDensity={1} effectRows={8} />
			</Copertina>

			<RichText
				data={home.introduzione}
				className="text-center mx-auto py-6 max-w-2xl text-balance"
			/>

			<HomeSection
				section="itinerari"
				title={itinerariSection.title}
				text={itinerariSection.description}
			>
				<Map gpxTracks={tracciati} />
			</HomeSection>

			<HomeSection
				section="luoghi"
				title={luoghi.title}
				text={luoghi.description}
				alignment="right"
			>
				<RecordsDisplay collection="luoghi" records={getRelations(home.sections.luoghi.items)} />
			</HomeSection>

			<HomeSection section="residenze" title={residenze.title} text={residenze.description}>
				<RecordsDisplay
					collection="residenze"
					records={getRelations(home.sections.residenze.items)}
				/>
			</HomeSection>
		</>
	)
}
