import { getLocale, getTranslations } from 'next-intl/server'

import { Button } from '@/modules/components/button'
import { enableStaticLocale } from '@/modules/i18n'
import { CollectionHeading } from '@/modules/components/collection-grid-heading'
import { Container } from '@/modules/components/container'
import { EmptyState } from '@/modules/components/empty-state'
import { T } from '@/modules/components/t'
import { getDb } from '@/modules/utils/server'

import CardResidenza from './_partials/card-residenza'

//

/** Time-based filter + searchParams: keep request-time rendering. */
export const dynamic = 'force-dynamic'

export default async function ResidenzePage(props: PageProps) {
	enableStaticLocale((await props.params).locale)

	const { filter, residenze } = await getPageData(props)
	const t = await getTranslations('residenze')

	const pagePartialsDataMap: Record<FilterType, PagePartialsData> = {
		programma: {
			heading: {
				title: t('programma.title'),
				cta: t('programma.link'),
				filter: 'archivio',
			},
			emptyState: {
				title: t('programma.empty_state'),
				cta: t('programma.empty_state_cta'),
				filter: 'archivio',
			},
		},
		archivio: {
			heading: {
				title: t('archivio.title'),
				cta: t('archivio.link'),
				filter: 'programma',
			},
			emptyState: {
				title: t('archivio.empty_state'),
				cta: t('archivio.empty_state_cta'),
				filter: 'programma',
			},
		},
	}

	const pagePartialsData = pagePartialsDataMap[filter]

	return (
		<>
			<CollectionHeading collection="residenze" />

			<Container className="max-w-5xl space-y-6 pt-10">
				<ResidenzeHeading {...pagePartialsData.heading} />

				{residenze.length === 0 && <ResidenzeEmptyState {...pagePartialsData.emptyState} />}

				{residenze.length > 0 && (
					<div className="flex flex-col gap-2">
						{residenze.map((item) => (
							<CardResidenza key={item.id} residenza={item} />
						))}
					</div>
				)}
			</Container>
		</>
	)
}

/* Page data loading */

const FILTER_PARAM = 'filter'
type FilterType = 'archivio' | 'programma'

interface PageProps {
	params: Promise<{ locale: string }>
	searchParams: Promise<{ [FILTER_PARAM]?: FilterType } | undefined | null>
}

async function getPageData(props: PageProps) {
	const { searchParams } = props
	const params = await searchParams
	const filter: FilterType = params?.[FILTER_PARAM] ?? 'programma'

	const db = await getDb()
	const locale = await getLocale()
	const today = new Date().toISOString()

	const { docs: residenze } = await db.find({
		collection: 'residenze',
		sort: ['start_date', 'end_date'],
		locale,
		where: {
			start_date: filter == 'programma' ? { greater_than: today } : { less_than: today },
		},
	})

	return {
		filter,
		residenze,
	}
}

/* Page partials */

type PagePartialsData = {
	heading: HeadingProps
	emptyState: EmptyStateProps
}

//

type HeadingProps = {
	title: string
	cta: string
	filter: FilterType
}

function ResidenzeHeading(props: HeadingProps) {
	const { title, cta, filter } = props

	return (
		<div className="flex items-center gap-6 w-full justify-between">
			<T tag="h2" className="text-residenze">
				{title}
			</T>
			<hr className="border grow hidden sm:block" />
			<Button color="residenze" href={filterToHref(filter)}>
				{cta}
			</Button>
		</div>
	)
}

//

type EmptyStateProps = {
	title: string
	cta: string
	filter: FilterType
}

function ResidenzeEmptyState(props: EmptyStateProps) {
	const { title, cta, filter } = props

	return (
		<EmptyState title={title} collection="residenze">
			<div>
				<Button color="residenze" href={filterToHref(filter)}>
					{cta}
				</Button>
			</div>
		</EmptyState>
	)
}

//

function filterToHref(filter: FilterType) {
	return `/residenze?${FILTER_PARAM}=${filter}`
}
