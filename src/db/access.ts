import type { Access } from 'payload'

export const isCmsUser: Access = ({ req: { user } }) => user?.collection === 'users'
