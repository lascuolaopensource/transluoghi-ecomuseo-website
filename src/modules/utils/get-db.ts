import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

export async function getDb(): Promise<Payload> {
	return getPayload({ config }) as Promise<Payload>
}
