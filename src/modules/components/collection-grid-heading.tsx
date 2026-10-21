import { getLocale } from 'next-intl/server'

import { MainCollection, getSectionDisplayData } from '@/modules/brand'
import { getCachedGlobal } from '@/modules/cache'
import type { Locale } from '@/modules/i18n'

import { PixelBorder } from './pixel-border'
import { RichText } from './richtext'
import { T } from './t'

//

interface CollectionHeadingProps {
	collection: MainCollection
}

export async function CollectionHeading(props: CollectionHeadingProps) {
	const { collection } = props

	const locale = (await getLocale()) as Locale
	const testiGlobal = await getCachedGlobal('testi', locale)

	const testi = testiGlobal[collection]
	if (!testi) {
		console.error(`Testi not found for collection ${collection}`)
		return null
	}

	const { className, invertedClassName } = getSectionDisplayData(collection)

	return (
		<>
			<PixelBorder className={className} />

			<div className="flex flex-col items-center justify-center gap-4 px-4 md:px-8 pt-10 text-center max-w-7xl mx-auto">
				<T tag="h1" className={invertedClassName}>
					{testi.title}
				</T>

				<RichText data={testi.description} className="prose md:prose-lg text-balance" />
			</div>
		</>
	)
}
