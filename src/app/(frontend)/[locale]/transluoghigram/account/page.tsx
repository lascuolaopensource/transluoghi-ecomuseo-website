import { LogOut } from 'lucide-react'

import { BackButton } from '@/modules/components/back-button'
import { Button } from '@/modules/components/shadcn/components/ui/button'
import { T } from '@/modules/components/t'
import { getDb } from '@/modules/utils/server'

import { Post } from '../_partials/post'
import { CreatePostForm } from './_partials/create-form'
import { DeletePostForm } from './_partials/delete-form'
import { EditPostForm } from './_partials/edit-form'
import { logout } from './_partials/logout.action'
import { validateUser } from './_partials/utils'

//

/** Auth + per-user posts: never share across requests. */
export const dynamic = 'force-dynamic'

export default async function Page() {
	const payload = await getDb()

	const user = await validateUser(payload)

	const posts = await payload.find({
		collection: 'social-post',
		sort: '-createdAt',
		overrideAccess: false,
		user,
		where: {
			owner: {
				equals: user.id,
			},
		},
	})

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center gap-6">
				<BackButton href="/transluoghigram" className="text-blue-700">
					Transluoghigram
				</BackButton>
				<form action={logout}>
					<Button
						variant="link"
						type="submit"
						className="text-blue-700 flex items-center gap-1 hover:cursor-pointer font-semibold"
					>
						<LogOut size={16} /> Esci
					</Button>
				</form>
			</div>
			<div className="flex justify-between items-center gap-6">
				<T tag="h1">I tuoi post</T>
				<CreatePostForm />
			</div>

			<ul className="space-y-4">
				{posts.docs.map((post) => (
					<li key={post.id} className="relative">
						<Post post={post} owner={user.name} />
						<div className="absolute top-2 right-2 bg-white border rounded-md p-1 flex items-center gap-1">
							<EditPostForm post={post} />
							<DeletePostForm post={post} />
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
