'use client'

import { Loader2Icon } from 'lucide-react'
import useInfiniteScroll from 'react-infinite-scroll-hook'

import type { SocialPost } from '@/payload-types'

import { PixelBorder } from '@/modules/components/pixel-border'
import { getRelation } from '@/modules/utils'

import { useLoadItems } from '../_hooks'
import { Post } from '../_partials/post'

//
//

type PostsListProps = {
	initialData?: SocialPost[]
	initialHasNextPage?: boolean
}

export function PostsList(props: PostsListProps) {
	const { initialData, initialHasNextPage } = props

	const { loading, items, hasNextPage, error, loadMore } = useLoadItems({
		sort: '-createdAt',
		depth: 2,
		limit: 10,
		initialData,
		initialHasNextPage,
	})

	const [sentryRef] = useInfiniteScroll({
		loading,
		hasNextPage,
		onLoadMore: loadMore,
		disabled: !!error,
		rootMargin: '0px 0px 400px 0px',
	})

	return (
		<>
			<ul>
				{items.map((post) => (
					<li key={post.id}>
						<Post post={post} owner={getRelation(post.owner)?.name ?? 'TR'} />
						<PixelBorder className="bg-white" />
					</li>
				))}
			</ul>

			{(loading || hasNextPage) && (
				<div ref={sentryRef} className="flex justify-center py-4 text-black bg-white">
					<p className="flex items-center gap-2">
						<Loader2Icon className="size-4 animate-spin" />
						<span>Loading...</span>
					</p>
				</div>
			)}

			{error && <div className="text-red-500 py-4 text-center">Error: {error.message}</div>}
		</>
	)
}
