import type { GlobalConfig } from 'payload'

import { F } from '@/db/_partials'

import { isCmsUser } from '../access'

//

export const Testi: GlobalConfig<'testi'> = {
	slug: 'testi',
	label: 'Testi',

	access: {
		read: () => true,
		update: isCmsUser,
	},

	fields: [
		F.titleAndDescription('luoghi', 'Introduzione pagina "Luoghi"'),
		F.titleAndDescription('itinerari', 'Introduzione pagina "Itinerari"'),
		F.titleAndDescription('residenze', 'Introduzione pagina "Residenze"'),
		F.titleAndDescription('persone', 'Introduzione pagina "Persone"'),
		F.titleAndDescription('articoli', 'Introduzione pagina "Articoli"'),
	],
}
