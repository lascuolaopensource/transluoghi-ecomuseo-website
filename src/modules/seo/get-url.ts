export function getServerSideURL() {
	return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
}

export function getServerSideOrigin() {
	return new URL(getServerSideURL()).origin
}
