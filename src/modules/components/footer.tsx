import type { Footer as FooterType } from '@/payload-types'

import { getCachedGlobal } from '@/modules/cache'
import { Link } from '@/modules/i18n'

import { Container } from './container'
import { Logo } from './logo'
import { PixelBorder } from './pixel-border'
import { RichText } from './richtext'
import { cn } from './shadcn/lib/utils'

//

export async function Footer() {
	const footer = await getCachedGlobal('footer')

	return (
		<>
			<PixelBorder className="w-full bg-black" />
			<footer className="bg-black text-white">
				<Container>
					<div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between">
						<div className="flex flex-col justify-between gap-4">
							<Logo textClassName="fill-white" />
							<SocialLinks footer={footer} className="hidden md:flex" />
						</div>

						<TextContent footer={footer} />

						<SocialLinks footer={footer} className="flex md:hidden" />
					</div>
				</Container>
			</footer>
		</>
	)
}

//

function TextContent(props: { footer: FooterType; className?: string }) {
	const { footer, className } = props

	const classes = cn(
		className,
		'prose-sm text-white prose-a:text-white md:grow md:basis-1 md:max-w-[300px]',
	)
	return (
		<>
			{footer?.text_left && <RichText data={footer?.text_left} className={classes} />}
			{footer?.text_right && <RichText data={footer?.text_right} className={classes} />}
		</>
	)
}

function SocialLinks(props: { footer: FooterType; className?: string }) {
	const { footer, className } = props
	const classes = cn('flex space-x-2', className)

	return (
		<div className={classes}>
			{footer.social_networks?.map((social) => (
				<Link
					key={social.id}
					href={social.url}
					className="text-white underline hover:cursor-pointer text-xs"
				>
					{social.name}
				</Link>
			))}
		</div>
	)
}
