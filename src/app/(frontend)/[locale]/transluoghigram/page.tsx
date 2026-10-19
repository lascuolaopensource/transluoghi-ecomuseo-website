import { Button } from '@/modules/components/button'
import { EmptyState } from '@/modules/components/empty-state'
import { T } from '@/modules/components/t'
import { getDb } from '@/modules/utils/server'

import { PostsList } from './_components/posts-list'

//

export default async function Page() {
	const db = await getDb()

	// Fetch initial page for SSR
	const posts = await db.find({
		collection: 'social-post',
		sort: '-createdAt',
		depth: 2,
		limit: 10,
		overrideAccess: false,
	})

	return (
		<div className="space-y-6">
			<T tag="h1">Transluoghigram</T>
			{posts.docs.length === 0 ? (
				<TransluoghigramEmptyState />
			) : (
				<PostsList initialData={posts.docs} initialHasNextPage={posts.hasNextPage} />
			)}
		</div>
	)
}

function TransluoghigramEmptyState() {
	return (
		// EmptyState paints its wash and letters at a negative z-index. On this green page
		// they fall behind the layout background; isolate keeps them on a light surface.
		<div className="isolate overflow-hidden rounded-lg bg-white">
			<EmptyState title="Attualmente, non ci sono post" collection="itinerari">
				<div>
					<Button color="itinerari" href="/itinerari">
						Esplora gli itinerari!
					</Button>
				</div>
			</EmptyState>
		</div>
	)
}
