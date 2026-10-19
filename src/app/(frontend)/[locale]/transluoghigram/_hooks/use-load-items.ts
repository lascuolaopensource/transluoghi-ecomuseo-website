'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { SocialPost } from '@/payload-types'

import { sdk } from './sdk'

//
//

type UseLoadItemsOptions = {
	limit?: number
	sort?: string
	depth?: number
	initialData?: SocialPost[]
	initialHasNextPage?: boolean
	initialPage?: number
}

type UseLoadItemsReturn = {
	loading: boolean
	items: SocialPost[]
	hasNextPage: boolean
	error: Error | null
	loadMore: () => void
}

export function useLoadItems(options: UseLoadItemsOptions = {}): UseLoadItemsReturn {
	const { limit = 10, sort, depth, initialData, initialHasNextPage, initialPage = 1 } = options

	// `[]` is truthy — only skip the first client fetch when SSR actually provided page 1.
	const hasInitialPage = initialData !== undefined
	const startingPage = hasInitialPage ? initialPage + 1 : initialPage
	const startingHasNextPage =
		initialHasNextPage ?? (hasInitialPage ? initialData.length >= limit : true)

	const [items, setItems] = useState<SocialPost[]>(initialData ?? [])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const [hasNextPage, setHasNextPage] = useState(startingHasNextPage)
	const [page, setPage] = useState(startingPage)
	const [initialLoad, setInitialLoad] = useState(!hasInitialPage)

	// Store values in refs to avoid recreating loadMore callback
	const loadingRef = useRef(loading)
	const hasNextPageRef = useRef(hasNextPage)
	const pageRef = useRef(page)
	const optionsRef = useRef({ limit, sort, depth })

	// Keep refs in sync with state
	useEffect(() => {
		loadingRef.current = loading
		hasNextPageRef.current = hasNextPage
		pageRef.current = page
		optionsRef.current = { limit, sort, depth }
	}, [loading, hasNextPage, page, limit, sort, depth])

	// loadMore is now stable - never changes! (empty dependency array)
	const loadMore = useCallback(async () => {
		// Read from refs instead of state to get latest values
		if (loadingRef.current || !hasNextPageRef.current) return

		loadingRef.current = true
		setLoading(true)
		setError(null)

		try {
			const currentPage = pageRef.current
			const { limit, sort, depth } = optionsRef.current

			const response = await sdk.find({
				collection: 'social-post',
				limit,
				page: currentPage,
				sort,
				depth,
			})

			setItems((prevItems) => {
				// Deduplicate by ID to prevent duplicates
				const existingIds = new Set(prevItems.map((item) => item.id))
				const newItems = response.docs.filter((item) => !existingIds.has(item.id))
				return [...prevItems, ...newItems]
			})

			const nextPage = response.hasNextPage ?? false
			hasNextPageRef.current = nextPage
			setHasNextPage(nextPage)

			setPage((prevPage) => {
				const newPage = prevPage + 1
				pageRef.current = newPage
				return newPage
			})
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Unknown error'))
		} finally {
			loadingRef.current = false
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (initialLoad) {
			loadMore()
			setInitialLoad(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialLoad])

	return {
		loading,
		items,
		hasNextPage,
		error,
		loadMore,
	}
}
