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
			<PostsList initialData={posts.docs} />
		</div>
	)
}
