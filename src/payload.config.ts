import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { it } from '@payloadcms/translations/languages/it'
import { localization } from '#/i18n'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Articoli } from '@/db/collections/articoli'
import { Itinerari } from '@/db/collections/itinerari'
import { Luoghi } from '@/db/collections/luoghi'
import { Media } from '@/db/collections/media'
import { Persone } from '@/db/collections/persone'
import { Residenze } from '@/db/collections/residenze'
import { Tracciati } from '@/db/collections/tracciati'
import { SocialAccount } from '@/db/collections/transluoghigram/social-account'
import { SocialMedia } from '@/db/collections/transluoghigram/social-media'
import { SocialPost } from '@/db/collections/transluoghigram/social-post'
import { Users } from '@/db/collections/users'
import { Video } from '@/db/collections/video'
import { ChiSiamo } from '@/db/globals/chi-siamo'
import { Footer } from '@/db/globals/footer'
import { Home } from '@/db/globals/home'
import { MobilitaSostenibile } from '@/db/globals/mobilita-sostenibile'
import { Testi } from '@/db/globals/testi'
import { migrations } from '@/db/migrations'

import { seo } from './modules/seo'
import { getServerSideOrigin } from './modules/seo/get-url'
import { getPaths } from './modules/utils/node'

//

const { dirname } = getPaths(import.meta.url)

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},

	collections: [
		Users,
		Media,
		Video,
		Tracciati,
		Itinerari,
		Luoghi,
		Persone,
		Residenze,
		Articoli,
		SocialPost,
		SocialMedia,
		SocialAccount,
	],
	globals: [Home, Testi, Footer, ChiSiamo, MobilitaSostenibile],

	secret: payloadSecret(),
	csrf: [getServerSideOrigin()],
	// App uses PayloadSDK REST only; GraphQL also Set-Cookie payload-token on auth.
	graphQL: {
		disable: true,
	},
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URI || '',
		},
		push: false,
		migrationDir: path.resolve(dirname, 'db/migrations'),
		// Run pending migrations on boot in production (Coolify / Docker).
		prodMigrations: migrations,
	}),
	sharp,
	plugins: [s3(), seo()],
	localization: localization,
	i18n: {
		fallbackLanguage: 'it',
		supportedLanguages: {
			it: it,
		},
	},
})

//

function payloadSecret() {
	const secret = process.env.PAYLOAD_SECRET?.trim()
	if (!secret) throw new Error('PAYLOAD_SECRET must be set')
	return secret
}

function s3() {
	return s3Storage({
		disableLocalStorage: true,
		collections: {
			[Media.slug]: true,
			[Tracciati.slug]: true,
			[Video.slug]: true,
			[SocialMedia.slug]: true,
		},
		bucket: process.env.S3_BUCKET!,
		enabled: true,
		config: {
			endpoint: process.env.S3_ENDPOINT!,
			region: process.env.S3_REGION!,
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY_ID!,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
			},
			forcePathStyle: true,
		},
	})
}
