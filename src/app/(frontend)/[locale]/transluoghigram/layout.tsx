import { PixelBorder } from '@/modules/components/pixel-border'
import { enableStaticLocale } from '@/modules/i18n'

//

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export default async function Layout({ children, params }: Props) {
	await enableStaticLocale(params)

	return (
		<div className="bg-itinerari">
			<PixelBorder className="bg-black" />

			<div className="max-w-sm md:max-w-md mx-auto py-12 space-y-12 px-4">{children}</div>
		</div>
	)
}
