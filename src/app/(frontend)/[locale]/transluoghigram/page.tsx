import { getTranslations } from 'next-intl/server'

import { enableStaticLocale } from '@/modules/i18n'

import { getCachedSocialFeed } from '@/modules/cache'
import { Button } from '@/modules/components/button'
import { EmptyState } from '@/modules/components/empty-state'
import { T } from '@/modules/components/t'
import type { PageWithLocaleProps } from '@/modules/utils/server'

import { PostsList } from './_components/posts-list'

//

export default async function Page(props: PageWithLocaleProps) {
	await enableStaticLocale(props.params)

	const t = await getTranslations('transluoghigram')
	const posts = await getCachedSocialFeed(10)

	return (
		<div className="space-y-6">
			<T tag="h1">Transluoghigram</T>
			{posts.docs.length === 0 ? (
				<TransluoghigramEmptyState title={t('empty_state')} cta={t('empty_state_cta')} />
			) : (
				<PostsList initialData={posts.docs} initialHasNextPage={posts.hasNextPage} />
			)}
		</div>
	)
}

function TransluoghigramEmptyState(props: { title: string; cta: string }) {
	const { title, cta } = props

	return (
		// EmptyState paints its wash and letters at a negative z-index. On this green page
		// they fall behind the layout background; isolate keeps them on a light surface.
		<div className="isolate overflow-hidden rounded-lg bg-white">
			<EmptyState title={title} collection="itinerari">
				<div>
					<Button color="itinerari" href="/itinerari">
						{cta}
					</Button>
				</div>
			</EmptyState>
		</div>
	)
}
