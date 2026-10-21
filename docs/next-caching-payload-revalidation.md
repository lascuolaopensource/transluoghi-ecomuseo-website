# Next.js caching and Payload revalidation

Research note for this repo (Next.js **16.4.2**, Payload **3.91.0**, App Router, Payload embedded under `src/app/(payload)/`). Locales are `it` and `en`. Implementation lives under `src/modules/cache/` (tagged `unstable_cache` queries + `revalidatePath` / `revalidateTag` hooks). Marketing routes are static-capable; `force-dynamic` remains on the residenze list (time + `searchParams`) and Transluoghigram account (auth). There is still no `cacheComponents` / `"use cache"`. Payload reads go through the Local API (`getPayload` in `src/modules/utils/server.ts`), which does not pass through the `fetch` Data Cache.

Sources are the docs shipped in `node_modules/next/dist/docs/` (they match this Next version), Next.js source where those docs are vague, and Payload’s docs plus the website template at tag `v3.91.0`. Discord threads are not used as authority.

The phrase **Full Route Cache** does not appear as a layer name in the Next 16 docs installed here. The same idea is the prerender / ISR entry that stores HTML and the RSC payload together. See [How revalidation works](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/how-revalidation-works.md) (“What Gets Revalidated”).

---

## Decision

Use the Payload 3.91 website-template split, on the caching model this app already runs (Cache Components off).

1. **Page queries that depend on Draft Mode** stay outside `unstable_cache`. Deduplicate them with React `cache` for one render. Invalidate the public URL with `revalidatePath` from `afterChange` / `afterDelete` when `_status` is published (and when a published doc is unpublished or deleted).
2. **Shared published data** (globals, a document reused on many pages, a list that is not itself a single route) goes in `unstable_cache` with explicit tags. Invalidate those tags with `revalidateTag(tag, 'max')` from the same hooks. Include `locale` in the key and the tag (`it` / `en`).
3. **`"use cache"` is the API Next recommends instead of `unstable_cache`**, but it requires `cacheComponents: true`. Payload’s installation docs say that flag can be turned on beside the admin without the old admin crash, and that full compatibility is not guaranteed. `"use cache"` also stores in memory by default and does not survive a new deploy or a new serverless instance. `unstable_cache` does. Keep `unstable_cache` until there is a reason to turn Cache Components on and a remote cache handler if durability matters.
4. **Do not call `updateTag` from a Payload hook.** It only works inside a Next.js Server Action. Admin saves are not Server Actions. From a hook or Route Handler, immediate expiry is `revalidateTag(tag, { expire: 0 })`.
5. **Skipping the data cache is valid** when the only cached artifact is the prerendered page. `revalidatePath('/it/...')` and `revalidatePath('/en/...')` then refresh that page on the next visit. That does not refresh other routes that embedded the same Local API result.
6. **No third-party library is required for a single-instance self-host.** Hooks + `revalidatePath` / `revalidateTag` match the official website template. Add a Redis **`cacheHandler` (singular)** only when you run multiple Node processes and need shared ISR / `unstable_cache` invalidation — prefer packages that advertise Next **16.3.8+ / 16.4** route-scoped keys (e.g. `@fortedigital/nextjs-cache-handler` ≥ 3.4.0 or `@trieb.work/nextjs-turbo-redis-cache`). Do **not** adopt `cacheHandlers` / Payload Cache Components plugins until `cacheComponents` is on. See [Ecosystem](#ecosystem-libraries-plugins-and-host-solutions).

---

## Caching layers in Next 16.4.2

Two models exist. The getting-started Caching page is the Cache Components model. The previous model is a separate guide, and it is the one that applies when `cacheComponents` is unset. This repo’s config has no `cacheComponents` flag.

| Layer                                    | What it stores                                                                                                                            | Lifetime                                                                                                                                                         | Status in 16.4.2                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Render memoization                       | One `fetch` (same URL and options) or one React `cache()` call during a single server render                                              | That render only                                                                                                                                                 | Stable. `fetch` memoization does not apply in Route Handlers.                                       |
| Data Cache                               | `fetch` responses opted in with `cache: 'force-cache'` or `next.revalidate`, and `unstable_cache` results (stored as fetch-cache entries) | Across requests, and across deploys and serverless instances                                                                                                     | Stable previous-model API. `fetch` is **not** cached unless you opt in.                             |
| Prerender / ISR cache                    | HTML and the RSC payload for a route, written together                                                                                    | Until `revalidate` seconds, or until `revalidatePath` / a matching tag                                                                                           | Stable. Segment config `export const revalidate`.                                                   |
| Client Cache                             | In-memory RSC payload in the browser for visited and prefetched routes                                                                    | Cleared on full refresh. Page segments are not reused on `<Link>` navigation unless `staleTimes` (experimental) opts them in. Layouts and loading UI are reused. | Stable behavior; `staleTimes` is marked experimental.                                               |
| `"use cache"` + `cacheLife` / `cacheTag` | Return value of an async function, component, or route segment                                                                            | `cacheLife` profile: client `stale`, server `revalidate`, server `expire`. Default handler is an in-memory LRU                                                   | **Stable only when `cacheComponents: true`.** Introduced experimental in 15, stabilized in 16.0.0.  |
| `"use cache: remote"`                    | Same, in a platform remote handler                                                                                                        | Same profiles, shared across instances                                                                                                                           | Requires `cacheComponents`. Docs describe it as the durable alternative to in-memory `"use cache"`. |
| `"use cache: private"`                   | Request-tied data (`cookies`, `headers`, `searchParams`)                                                                                  | Not stored in a server cache across production requests. Client may keep it for `stale`                                                                          | Requires `cacheComponents`.                                                                         |

Citations: [Caching (previous model)](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md), [fetch](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md), [use cache](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md) (version history and runtime table), [use cache: remote](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-remote.md), [use cache: private](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-private.md), [cacheComponents](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md), [glossary: Client Cache](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/04-glossary.md), [staleTimes](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/staleTimes.md), [Migrating to Cache Components](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md) (persistence of the fetch Data Cache and of `unstable_cache`).

`cacheLife` and `cacheTag` were `unstable_cacheLife` / `unstable_cacheTag` before 16.0.0. The unprefixed names are stable. They throw unless called inside a cache directive, and the directive throws unless `cacheComponents` is on. [cacheLife version history](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md), [cacheTag version history](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheTag.md), [Version 16 upgrade](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md) (“cacheLife and cacheTag”).

Preset profiles (`stale` / `revalidate` / `expire`): `default` 5m / 15m / never, `seconds` 30s / 1s / 1m, `minutes` 5m / 1m / 1h, `hours` 5m / 1h / 1d, `days` 5m / 1d / 1w, `weeks` 5m / 1w / 30d, `max` 5m / 30d / 1y. [cacheLife reference](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md).

### `fetch` cache (previous model)

- Default is “auto no cache”: fetched on every request in development; during `next build` it is fetched once if the route is prerendered and no Request-time API has run yet. After `cookies()` / `headers()` it runs per request.
- `cache: 'force-cache'` reads the Data Cache (match on URL, method, headers, body). Only HTTP 200 is stored.
- `cache: 'no-store'` always hits the network.
- `next: { revalidate: false | 0 | number }` and `next: { tags }` (max 256 characters, max 128 tags).
- Draft Mode skips the fetch cache (no read, no write).

[fetch API](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md), [Draft Mode guide](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md).

The Local API does not go through `fetch`, so these options do not wrap `payload.find`.

### `connection()`, `io()`, `unstable_noStore`

- `connection()` from `next/server` waits for a real request. Stable since 15.0.0. It replaces `unstable_noStore` for opting out of prerendering. [connection](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md).
- With Cache Components, the docs prefer `io()` from `next/cache` to leave the static shell. `io()` resolves immediately in apps **without** Cache Components. [io](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/io.md).
- `unstable_noStore` is legacy. The v15 note says to use `connection`. Calling it **inside** `unstable_cache` does not opt out of caching; the `unstable_cache` options win. [unstable_noStore](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_noStore.md).

### `refresh` and `router.refresh`

- `refresh()` from `next/cache` refreshes the client router. **Server Actions only.** It takes no arguments. [refresh](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/refresh.md).
- `router.refresh()` in a Client Component refetches the current route and clears the Client Cache for that route. It does **not** invalidate the server cache. [useRouter](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md).

Payload’s server-side Live Preview docs say the admin `postMessage` should end in `router.refresh()` so the iframe rerenders from the Local API. That is a client refresh, not tag invalidation. [Server-side Live Preview](https://payloadcms.com/docs/live-preview/server).

---

## `unstable_cache`

### Status

Not removed in 16.4.2. The API page says it **has been replaced** by `"use cache"` and recommends Cache Components. The migration guide says **no change is required**: it keeps working with Cache Components, and you can migrate later. [unstable_cache](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_cache.md), [Migrating to Cache Components, `unstable_cache`](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md).

Version history in the API page: introduced in `v14.0.0`. No removal row.

Why it still matters: the same migration page says `unstable_cache` persists across deployments and serverless instances, and `"use cache"` does not (in-memory, scoped to one deployment). The `"use cache"` page repeats that, and points back at `unstable_cache` or the `fetch` cache for data that must survive a deploy. For a durable replacement under Cache Components, the docs point at `"use cache: remote"` or a custom `cacheHandlers` implementation.

### Signature

```ts
import { unstable_cache } from 'next/cache'

const cached = unstable_cache(fetchData, keyParts?, options?)
// cached(...args) => Promise<result>
```

- `fetchData`: async function, must return a Promise.
- `keyParts`: optional extra key segments. The key already includes the function’s string form and `JSON.stringify` of the arguments. Use `keyParts` for closed-over values that are not arguments.
- `options.tags`: invalidation tags. Tags do **not** identify the entry.
- `options.revalidate`: seconds. Omit or pass `false` to keep the entry until `revalidateTag` or `revalidatePath`. Passing `0` throws (`Invariant revalidate: 0 can not be passed to unstable_cache()`).

[API reference](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_cache.md). The throw and the key construction are in [unstable-cache.js](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/server/web/spec-extension/unstable-cache.js) (`fixedKey`, `invocationKey`, `options.revalidate === 0`).

### What it caches, and where it runs

The callback result is `JSON.stringify`’d into an incremental-cache entry of kind `FETCH`, then `JSON.parse`’d on read. A source comment says non-JSON values are still a TODO. Consequences that follow from `JSON.stringify` / `JSON.parse` (not a separate docs table):

- Dates become ISO strings.
- `undefined` object fields disappear; array holes become `null`.
- `BigInt`, functions, symbols, and class instances throw or do not round-trip.
- The argument key uses `JSON.stringify(args)`. The source notes that `undefined` is coerced to `null`, so those arguments share a key.

Tags: `validateTags` keeps strings up to **256** characters and stops after **128** valid tags (`NEXT_CACHE_TAG_MAX_LENGTH` / `NEXT_CACHE_TAG_MAX_ITEMS` in `node_modules/next/dist/lib/constants.js`). Invalid tags are warned and dropped, so `revalidateTag` on an over-long tag does nothing. The public `revalidateTag` page states the same 256-character rule.

It needs an incremental cache (`workStore.incrementalCache` or `globalThis.__incrementalCache`). If that is missing it throws `Invariant: incrementalCache missing`. That is an App Router (or Pages) render with the Next cache, not an arbitrary Node script.

Nested `unstable_cache` calls set `isNestedUnstableCache` and **skip the inner cache read**, same idea as nested fetches. Draft mode (`workStore.isDraftMode`) skips both read and write. [unstable-cache.js](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/server/web/spec-extension/unstable-cache.js) lines around the draft and nested-cache checks. The Draft Mode guide states the same bypass in prose. [Draft Mode](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md).

### What must stay outside the callback

The docs forbid, inside the cached function:

- `headers()` or `cookies()` (read them outside and pass arguments)
- `connection()`
- enabling or disabling Draft Mode
- `revalidateTag`, `updateTag`, or `revalidatePath`
- a function that uses `"use cache: private"`

[unstable_cache, Unsupported operations](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_cache.md).

`draftMode()` reads a cookie. Calling it inside the callback is the unsupported request-data case. The website template therefore reads `draftMode()` **beside** a React `cache()` wrapper, and uses `unstable_cache` only for helpers that do not take draft or auth.

### What it does not invalidate

`unstable_cache` is a server Data Cache entry. It does not clear the Client Cache. Client Cache is cleared when `revalidateTag`, `revalidatePath`, `updateTag`, or `refresh` run **from a Server Action**, or via `router.refresh()`, `cookies.set`, or `cookies.delete`. A Route Handler call of `revalidateTag` is not in that Server Action list. [cacheLife, Client cache behavior](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md), [glossary: Client Cache](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/04-glossary.md).

`revalidatePath` on one URL does not invalidate a Data Cache tag used by another URL. The `/blog` vs `/dashboard` example is in the `revalidatePath` page.

On-demand tag invalidation is local to the Node instance unless a custom cache handler implements `updateTags` / `refreshTags`. The default filesystem cache is correct for a single instance. [How revalidation works, Multi-Instance](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/how-revalidation-works.md).

Stale behavior for `unstable_cache` itself (source, not the API page): if the entry exists and `isStale`, App Router returns the stale JSON immediately and recomputes in the background, unless the consumer will itself be stored in a server cache, in which case it waits. Draft and `fetchCache === 'force-no-store'` bypass that.

---

## On-demand revalidation in Next 16

### `revalidateTag(tag, profile)`

```ts
revalidateTag(tag: string, profile: string | { expire?: number }): void
```

Second argument is required for the supported signature. It is a `cacheLife` profile name, or `{ expire }` in seconds. Only the profile’s **`expire`** is read.

- `'max'` (recommended): stale-while-revalidate with a one-year window. The next request serves the stale entry and regenerates in the background.
- Another profile name or `{ expire: number }`: same, with that expire window.
- `{ expire: 0 }`: no stale serve. Next request blocks until regeneration. Use this from a Route Handler when the data must disappear immediately.
- One argument (`revalidateTag(tag)`): deprecated, currently behaves like `{ expire: 0 }` if TypeScript is suppressed, and may be removed.

The call marks tags stale. A **later request** does the work. Pages are not all regenerated at call time.

Allowed in Server Functions and Route Handlers. Not in Client Components.

[revalidateTag](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md), [Version 16 upgrade, Caching APIs](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md).

Tag assignment the `revalidateTag` page lists: `fetch` `next.tags`, or `cacheTag()` inside `"use cache"`. The previous-model guide also lists `unstable_cache` `options.tags`. Both are valid; the API page’s two-bullet list omits `unstable_cache` and should not be read as “tags on `unstable_cache` stopped working.”

### `updateTag(tag)`

Server Actions only. Expires the tag immediately so the next read in that navigation waits for fresh data (read-your-own-writes). Calling it from a Route Handler throws `updateTag can only be called from within a Server Action`. [updateTag](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md).

The upgrade guide’s shorthand “without profile, legacy `revalidateTag` equals `updateTag`” matches `{ expire: 0 }` on the API page. It does not make `updateTag` callable from hooks.

### `revalidatePath(path, type?)`

```ts
revalidatePath(path: string, type?: 'page' | 'layout'): void
```

- Literal path (`/it/articoli/foo`): omit `type`.
- Dynamic pattern (`/it/articoli/[slug]`): `type` is required (`'page'` or `'layout'`).
- Do not append `/page` or `/layout`. Path max 1024 characters, case-sensitive. No trailing-slash requirement.
- `'layout'` also invalidates nested pages under that layout. `'page'` does not invalidate child pages.
- `revalidatePath('/', 'layout')` purges the Client Cache and invalidates all cached data for the next visit.
- Server Functions: the open page updates immediately; the docs also say every previously visited page currently refreshes on the next navigation, and that this is temporary.
- Route Handlers: the path is marked; regeneration happens on the **next visit**, not for every dynamic segment at once.
- With rewrites, pass the **destination** path (the route file), not the public source path.

[revalidatePath](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md).

The revalidating guide says to prefer tags over paths when you know the tags, because a path refresh does not cover other pages that share the data. [Revalidating](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md).

---

## Payload 3 official guidance

There is **no** `@payloadcms/next` export dedicated to revalidation. Package exports are `withPayload`, layouts, routes, templates, auth, utilities, views, client, rsc, css. A search of `node_modules/@payloadcms/next/dist` for `revalidate` / `unstable_cache` returned no files. Hooks call `next/cache` themselves.

The docs site does not have a “Next.js cache” chapter that names `unstable_cache`. What exists:

### Installation and Cache Components

Next.js `16.2.6+` is a supported range (this repo is 16.4.2). `cacheComponents` “can be enabled alongside Payload without causing errors in the admin panel”; “full compatibility is not guaranteed,” with a link to the status PR. [Installation](https://payloadcms.com/docs/getting-started/installation).

That PR is [payload#16020](https://github.com/payloadcms/payload/pull/16020) (also commit message on `1ecd7dd`). It is first-party, and it is the page the install docs point at. It says `withPayload` sets `PAYLOAD_CACHE_COMPONENTS_ENABLED` and the admin root layout adds a `Suspense` so cookie/auth reads do not crash the build. Known limits it lists, attributed to Next rather than Payload: gray flash on hard refresh of the admin, `notFound()` responding HTTP 200, and React `Activity` keeping hidden routes in the DOM (Playwright strict selectors). It says they do not guarantee full admin compatibility beyond that error suppression.

### Local API

`getPayload({ config })` is the cached Payload **instance** (one inited config), not an HTTP cache of documents. [Performance](https://payloadcms.com/docs/performance/overview), [Local API](https://payloadcms.com/docs/local-api/overview).

Local options that matter here:

- `locale`: any configured locale. Omitted means `defaultLocale`. `'all'` or `'*'` returns every locale’s values as objects.
- `fallbackLocale`: a locale, an array, or `false` / `'none'` / `'null'` to disable fallback. Config-level `fallback` defaults to `true`.
- `draft`: documented on the Preview page (`draft: isDraftMode`). When versions/drafts are enabled, `draft: true` reads the draft version.
- `overrideAccess`: **defaults to `true`** on the Local API. The template sets it `false` for public static generation and `true` only when draft mode has already authenticated the preview request.
- `req`: pass it through when a transaction is open (Postgres). Inside `unstable_cache` you do not have the incoming admin `req`. A cached public read should not borrow an editor request.

[Local API](https://payloadcms.com/docs/local-api/overview), [Localization](https://payloadcms.com/docs/configuration/localization), [Preview](https://payloadcms.com/docs/admin/preview).

`localizeStatus` is beta, off unless `experimental.localizeStatus` and `versions.drafts.localizeStatus` are both set. Otherwise `_status` is one string for the document, not per locale. [Localization, Status Localization](https://payloadcms.com/docs/configuration/localization).

### Hooks

`afterChange` on a collection runs after create/update. `afterChange` on a global is the documented place to “purge caches of your applications.” Arguments include `doc`, `previousDoc`, `operation`, `req`, and `context`. [Collection hooks](https://payloadcms.com/docs/hooks/collections), [Global hooks](https://payloadcms.com/docs/hooks/globals).

If the hook is `async` and returns a Promise, Payload awaits it. Returning nothing does not wait. Revalidation should stay on the awaited path if the save response must not race the cache mark. [Hooks overview](https://payloadcms.com/docs/hooks/overview).

`context.disableRevalidate` is the template’s switch so seeds and nested writes can skip Next invalidation. Context is the supported way to pass that flag. [Context](https://payloadcms.com/docs/hooks/context).

### What the 3.91.0 website template actually does

Tag `v3.91.0` (same package version as this repo), not `main` alone. Checked files match `main` for these snippets on the day of this note.

**Pages** (`templates/website/src/app/(frontend)/[slug]/page.tsx`): `generateStaticParams` plus `queryPageBySlug` wrapped in React `cache`, which calls `draftMode()` and `payload.find({ draft, overrideAccess: draft })`. No `unstable_cache`. README “Draft Preview” says the front end is statically generated and an `afterChange` hook regenerates it when `_status === 'published'`.

**Shared documents and globals** do use `unstable_cache`:

- `getCachedDocument(collection, slug)` tags `` `${collection}_${slug}` ``. Key parts `[collection, slug]`. No `revalidate` number (indefinite until tag/path invalidation).
- `getCachedGlobal(slug, depth)` tags `` `global_${slug}` ``.

`getCachedGlobal` in 3.91.0 calls `findGlobal` without an explicit `overrideAccess` (Local API default is `true`). The page query is the one that sets `overrideAccess: draft`.

**Hooks:**

- Published page: `revalidatePath(path)` and `revalidateTag('pages-sitemap', 'max')`.
- Unpublish: same for the previous path.
- Delete: path plus the sitemap tag.
- Header global: `revalidateTag('global_header', 'max')` only.

Paths in that template are `/${slug}`, not locale-prefixed. This site’s public URLs are `/it/...` and `/en/...`, so the same hook has to emit both locale paths (or `revalidatePath` with a pattern that matches the route files).

The template README also says Payload Cloud turns Next caching off (`no-store`, `dynamic = 'force-dynamic'`) because Cloudflare sits in front, and that self-hosting re-enables Next caching by removing those. That paragraph links an older caching URL (`/docs/app/building-your-application/caching`). Treat the **hook and helper source** as the concrete 3.91 pattern, and that README paragraph as host-specific.

Discord suggestions to wrap every `payload.find` in `unstable_cache` are community replies. The template does not do that for draft-aware page queries.

---

## Lists, single documents, locale

| Change                             | What must be invalidated                                                                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One published document, one URL    | `revalidatePath` for that locale URL. If the body was also stored under `unstable_cache` tag `collection_slug_locale`, `revalidateTag` that tag too.                                                                                                     |
| A list page that queried many docs | The list route’s path, **or** a shared tag such as `collection_list_it` placed on the list’s `unstable_cache`. Publishing one doc does not automatically refresh the list. The template’s sitemap tag is this idea for one consumer, not for every page. |
| A global (header, footer, home)    | One tag per global **and locale** (`global_footer_it`). `revalidateTag` covers every page that read that cached function. `revalidatePath` of a single page does not.                                                                                    |
| Slug rename or unpublish           | Previous path and new path. The 3.91 page hook does this when `_status` leaves `published`.                                                                                                                                                              |
| Draft save                         | Do not invalidate the public cache. The template checks `_status === 'published'` first. Preview uses Draft Mode, which bypasses `unstable_cache` and the fetch cache for that cookie only.                                                              |
| `it` vs `en`                       | Pass `locale` into `payload.find` / `findGlobal`. Put it in `unstable_cache` arguments or `keyParts` and in the tag. Two locales are two entries. Omitting `locale` returns `defaultLocale` only.                                                        |

`revalidatePath('/it/articoli/[slug]', 'page')` refreshes every matching **page** file, not a child route under it. A literal path refreshes one URL. [revalidatePath examples](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md).

---

## Safe and unsafe

Safe on this codebase today:

- React `cache()` around a Local API read that also calls `draftMode()`, for per-request dedupe.
- `unstable_cache` around a **published** Local API read that receives `locale`, `slug`, and query inputs as arguments, with tags, and with `overrideAccess: false` if the public site must respect access control.
- `revalidatePath` of the concrete `/it` and `/en` paths, and `revalidateTag(tag, 'max')`, from collection `afterChange` / `afterDelete` and global `afterChange`, gated by `context.disableRevalidate` and by published status.
- `revalidateTag(tag, { expire: 0 })` from those hooks when the next anonymous request must not see the stale Data Cache entry.
- `getPayload({ config })` inside the cached function (instance cache only).

Unsafe or the wrong tool:

- `unstable_cache` around `draftMode()`, `cookies()`, `headers()`, or `payload.auth`.
- Caching a find that uses `overrideAccess: true` and then serving it to anonymous users. The default Local API skips access control.
- Passing the admin `req` into a cached function. It is request data, and it pins a transaction and a user.
- `updateTag` or `refresh()` inside a Payload hook. Both are Server Actions only.
- Assuming `revalidatePath('/it/...')` refreshes `/en/...` or a list that used a different cache entry.
- Enabling `cacheComponents` only to unlock `"use cache"`, without accepting the admin limits in payload#16020 and the in-memory lifetime of `"use cache"`.
- `"use cache"` on a function that calls `cookies()` / `headers()`. That throws. Draft Mode may be **read** inside `"use cache"` (`isEnabled` only); `enable()` / `disable()` throw. [use cache, Draft Mode](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md).

### When each tool is the one to pick

| Situation                                                                                                                                 | Tool                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor publish should update a statically generated URL. The Local API runs during that page render and is not reused elsewhere.          | No data cache. `revalidatePath` for each locale path. React `cache` if the page and `generateMetadata` share one find.                                                                                         |
| The same published payload is read from several routes, or a webhook must drop a result without knowing every path.                       | `unstable_cache` + tags + `revalidateTag(..., 'max')` or `{ expire: 0 }`.                                                                                                                                      |
| You have opted into `cacheComponents`, accepted the admin limits, and can tolerate in-memory entries (or you have `"use cache: remote"`). | `"use cache"` with `cacheTag` / `cacheLife('max')`, invalidated the same way. Migration is mechanical: arguments become the key, `tags` becomes `cacheTag`, `revalidate` seconds become a `cacheLife` profile. |
| Preview.                                                                                                                                  | Draft Mode cookie. Do not store that response.                                                                                                                                                                 |
| Logged-in, per-user data.                                                                                                                 | No shared cache. `connection()` or an uncached Suspense read. `"use cache: private"` only after Cache Components.                                                                                              |

---

## Ecosystem: libraries, plugins, and host solutions

What exists beyond calling `next/cache` yourself. Verified against package READMEs / npm pages and Next.js / Payload first-party docs. Download counts and “last updated” are snapshots from those pages at research time; treat them as signals, not guarantees.

### Two Next.js config keys (easy to confuse)

| Config                    | Backs                                                                                                                                                      | Official docs                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `cacheHandler` (singular) | ISR / prerender pages, route-handler responses, optimized images (and the previous-model Data Cache / `unstable_cache` path through the incremental cache) | [Custom Next.js Cache Handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath) |
| `cacheHandlers` (plural)  | `"use cache"` / `"use cache: remote"` when `cacheComponents` is on. `"use cache: private"` is not configurable                                             | [cacheHandlers](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers)                              |

Next’s singular-handler page states explicitly that `cacheHandler` is **not** used by `'use cache'`. For multi-instance self-hosting, the plural docs require `updateTags` / `refreshTags` / `getExpiration` against shared storage so `revalidateTag` on one process reaches the others. Set `cacheMaxMemorySize: 0` when Redis (or similar) is the source of truth, or each process keeps its own stale LRU. This repo uses `output: 'standalone'` and has neither key set.

Official examples: [cache-handler-redis](https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis) (raw `redis` client; implements **both** singular and plural APIs; README lists community production handlers), [cache-handler-redis-turbo](https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis-turbo) (uses `@trieb.work/nextjs-turbo-redis-cache`). Next does **not** publish an official Redis npm package — the example is the first-party reference implementation. Hosting providers “should typically provide” a remote handler for `"use cache: remote"`; self-hosters configure `cacheHandlers` themselves ([`use cache: remote`](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-remote.md)).

**`"use cache: remote"` persistence note:** remote entries still do **not** survive deploys (keys include `deploymentId` / `buildId`). For data that must survive deploys, Next still points at `unstable_cache` or the `fetch` cache ([same page](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-remote.md)).

### Community Next cache handlers

| Package                                                                                                                           | What it is                                                                                                                                                                                                                  | Next fit                                                                                                                                                                                                                                       | Local API + `unstable_cache` tags                                                                  | Multi-instance                                    | Fit for this repo                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [@neshca/cache-handler](https://www.npmjs.com/package/@neshca/cache-handler) **1.9.0**                                            | Former default community ISR handler (Redis). Peer `next` `>=13.5.1 <15`. Last publish **2024-11-26**; README called it the final 1.x before a 2.0 that never shipped under this name                                       | **Dead for Next 15/16** (peer upper bound). Do not ignore peers                                                                                                                                                                                | Would have covered FETCH/`unstable_cache` on Next 14                                               | Yes (design)                                      | **Skip**                                                                                        |
| [@fortedigital/nextjs-cache-handler](https://www.npmjs.com/package/@fortedigital/nextjs-cache-handler) **3.4.0**                  | Maintained neshca successor (independent from 2.0). Redis / `ioredis`. Singular `cacheHandler` only                                                                                                                         | Peer `next: >=16.1.5`. **3.3.0+** for 16.3.0 `segmentData`; **3.4.0+** for **16.3.8+ / 16.4** route-scoped keys. Feature matrix: `unstable_cache` ✅, `revalidateTag(tag, profile)` ✅, **`cacheHandlers` / `"use cache"` ❌** (“Help needed”) | Yes — singular handler stores FETCH entries that hooks invalidate with `revalidateTag(tag, 'max')` | Yes (shared Redis tag maps)                       | **Best Redis pick while Cache Components stays off**                                            |
| [@trieb.work/nextjs-turbo-redis-cache](https://www.npmjs.com/package/@trieb.work/nextjs-turbo-redis-cache) **1.18.2**             | Production Redis handler named in the official Redis example README. Separate exports for singular vs plural (`redisCacheHandler` object ≠ default class). L1+L2, batch tags, Pub/Sub; needs Redis `notify-keyspace-events` | Peer `next: >=15.0.3 <17`. README tests through Next **16.3** with `cacheComponents` true/false                                                                                                                                                | Yes (singular)                                                                                     | Yes (documents short Pub/Sub consistency windows) | Strong for multi-replica **and** a later CC migration; re-check on **16.4.2** before locking in |
| [@mirunamu/next-redis-cache](https://www.npmjs.com/package/@mirunamu/next-redis-cache) **2.0.2**                                  | One package for **both** APIs; build-output fallback + circuit breaker when Redis is down                                                                                                                                   | Peer `next: ^16.1`; README tested 16.1 / 16.3 (not claiming 16.4 yet)                                                                                                                                                                          | Yes (singular)                                                                                     | Yes (shared tag state)                            | Viable dual-API option; verify 16.4.2 yourself                                                  |
| [next-cache-handlers](https://www.npmjs.com/package/next-cache-handlers) **2.0.1**                                                | Redis for **`cacheHandlers` only** (`"use cache"` / remote)                                                                                                                                                                 | Peer `next: ^16`, `redis: ^5`                                                                                                                                                                                                                  | No                                                                                                 | Yes for `"use cache"` tags (`updateTags`)         | Only after `cacheComponents: true`                                                              |
| [@mrjasonroy/cache-components-cache-handler](https://www.npmjs.com/package/@mrjasonroy/cache-components-cache-handler) **16.5.1** | Next 16+ `cacheHandlers` (memory / Redis / Valkey / ElastiCache). Named in official Redis example README. Also exports ISR helpers; README documents **limits** on singular `cacheHandler` — main product is plural         | Peer `next: ^16`. Needs `cacheComponents: true` for the primary API                                                                                                                                                                            | Do not assume ISR helpers replace a production singular handler without reading their limits       | Yes for plural                                    | After an intentional Cache Components migration                                                 |
| [@leejpsd/nextjs-cache-handler](https://www.npmjs.com/package/@leejpsd/nextjs-cache-handler) **1.0.0**                            | Claims both singular and plural Redis handlers                                                                                                                                                                              | npm **1.0.0** (2026-08); not listed in the official example README                                                                                                                                                                             | Claimed                                                                                            | Claimed                                           | Optional / thin history — prefer packages named by Vercel’s example if choosing                 |
| [@pantheon-systems/nextjs-cache-handler](https://www.npmjs.com/package/@pantheon-systems/nextjs-cache-handler) **0.13.3**         | GCS + filesystem singular handler                                                                                                                                                                                           | Peer `next: >=15.5.28 <17`                                                                                                                                                                                                                     | Pantheon-shaped hosts                                                                              | Via GCS                                           | Not a natural Coolify/`standalone` + Redis fit                                                  |

Hand-rolling against the official Redis example is still valid. The packages mainly save tag-map, serialization (`Buffer` / `Map` in entries), and multi-instance edge cases ([self-hosting — Configuring Caching](https://nextjs.org/docs/app/guides/self-hosting#configuring-caching)).

**Stores ≠ handlers:** [`@upstash/redis`](https://www.npmjs.com/package/@upstash/redis) and [`@vercel/kv`](https://www.npmjs.com/package/@vercel/kv) are Redis **clients / KV stores**, not Next `cacheHandler` implementations. No dedicated Cloudflare KV → Next incremental-cache package was verified on npm for this note.

**`unstable_cache` + tags work with the singular `cacheHandler`** because entries go through the incremental / FETCH cache path. They do **not** use `cacheHandlers.remote`. Switching to `"use cache"` without a plural handler leaves you on the default in-memory LRU.

### Payload-specific plugins and helpers

There is still **no** official `@payloadcms/plugin-*` for Next revalidation. `@payloadcms/next` exports no revalidate helper. The website template’s hand-written hooks remain the first-party pattern.

| Package                                                                                                          | What it does                                                                                                                                                                                                         | Status / caveats                                                                                                          | Fit for this repo                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website template hooks + `getDocument` / `getGlobals`                                                            | `revalidatePath` + `revalidateTag(..., 'max')`; `unstable_cache` only for shared docs/globals                                                                                                                        | First-party at Payload `v3.91.0`                                                                                          | **Default choice**                                                                                                                                                  |
| Official `@payloadcms/plugin-*` revalidation plugin                                                              | —                                                                                                                                                                                                                    | **None exists** (seo, search, form-builder, redirects, cloud, stripe, ecommerce, … — no cache/revalidate plugin on npm)   | N/A                                                                                                                                                                 |
| [`@payloadcms/payload-cloud`](https://www.npmjs.com/package/@payloadcms/payload-cloud) **3.91.0**                | S3 + Cloudflare CDN for **uploads**; purge hooks on media change. README “Future → API CDN” **not shipped**                                                                                                          | Does **not** implement Next page/`unstable_cache` invalidation                                                            | Orthogonal to Local API page cache; package is in `package.json` but app code does not call `payloadCloudPlugin` (confirm before assuming upload caching is active) |
| [payload-plugin-cache](https://www.npmjs.com/package/payload-plugin-cache) **0.9.8**                             | Declarative tag registry; `nextCacheAdapter` → Next 16 `revalidateTag(tag, profile)` + optional `revalidatePath`; `"use cache"` helpers; drafts / `context.disableRevalidate`; locale-aware incl. `locale === 'all'` | Peer `payload ^3.80`, `next ^15 \|\| ^16`. Young / low traffic                                                            | Optional glue once routes are static and read-side tags match                                                                                                       |
| [payload-revalidate](https://www.npmjs.com/package/payload-revalidate) **0.7.1**                                 | Auto hooks: tags `collection`, `collection.id`, `collection.slug` for `unstable_cache`                                                                                                                               | Peer `next: ^15.5.4 \|\| ^16`, `payload: ^3.57`. README: **“VERY early stage”**, Postgres-tested                          | Optional; still design locale tags yourself (`it` / `en`)                                                                                                           |
| [@pro-laico/payload-revalidate](https://www.npmjs.com/package/@pro-laico/payload-revalidate) **0.8.5**           | Field-driven busts + `"use cache"` finders (`findDoc` / `findIds` / …)                                                                                                                                               | Peer `next: >=16`, `payload: ^3`. **Requires `cacheComponents: true`**                                                    | Wrong model until Cache Components is accepted                                                                                                                      |
| [@ggaidelevicius/payload-isr](https://www.npmjs.com/package/@ggaidelevicius/payload-isr) **1.2.1**               | Wires `afterOperation` / `afterChange`; you pass `revalidatePath` / `revalidateTag` callbacks; publish/unpublish/delete; optional full rebuild                                                                       | Peer `payload: ^3.37`. Framework-agnostic callbacks                                                                       | Less boilerplate when many collections; you still own Next API signatures (pass profile on tags)                                                                    |
| [@payload-enchants/cached-local-api](https://www.npmjs.com/package/@payload-enchants/cached-local-api) **1.2.2** | Wraps Local API in `unstable_cache`; auto `revalidateTag` on write                                                                                                                                                   | Last publish **2024-07**; peer `payload: ^3.0.0-beta.61`; experimental; one-arg `revalidateTag` (Next 16 wants a profile) | **Avoid** on 3.91 / Next 16 without a maintained fork                                                                                                               |
| [@whatworks/payload-paths](https://www.npmjs.com/package/@whatworks/payload-paths) **0.3.1**                     | Path resolution; optional `nextPathsCache` on `unstable_cache`                                                                                                                                                       | Path lookup caching, not general CMS page caching                                                                         | Only if you adopt that path system                                                                                                                                  |
| [@composius/payload-plugin-menus](https://www.npmjs.com/package/@composius/payload-plugin-menus) **1.4.0**       | Menus plugin that invalidates its own Next tags on save                                                                                                                                                              | Domain-specific                                                                                                           | Not a general cache layer                                                                                                                                           |

Community Discord answers that say “wrap every `find` in `unstable_cache`” are **not** what the 3.91 template does for draft-aware page queries.

### Host and CDN behavior

| Environment                                             | What matters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **This repo (`standalone`, self-host / Coolify-style)** | Default filesystem incremental cache is per Node process. One replica: hooks + path/tag revalidation are enough once `force-dynamic` is lifted. Several replicas: shared singular `cacheHandler` (Redis) or accept divergent caches. Website template README lists Coolify / VPS / Docker as valid self-host targets; none of them add a shared cache by themselves.                                                                                                                                                                                                                   |
| **Vercel**                                              | Platform Data Cache / ISR (framework-defined infrastructure). First-party: [ISR on Vercel is now faster…](https://vercel.com/blog/isr-on-vercel-is-now-faster-and-more-cost-efficient) (2025-01-30). Custom Redis handlers are usually unnecessary on Vercel.                                                                                                                                                                                                                                                                                                                          |
| **Payload Cloud**                                       | `@payloadcms/payload-cloud` documents **upload** CDN caching via Cloudflare (default 24h, purge on update/delete). It does **not** ship API-response CDN purge yet (“In the future…” on the package README). Website-template README: Next caching is disabled on Payload Cloud (`no-store`, `force-dynamic`) because Cloudflare sits in front; self-host should remove those to re-enable Next cache. This repo depends on `@payloadcms/payload-cloud` in `package.json` but does not call `payloadCloudPlugin` in app code — confirm before assuming Cloud upload caching is active. |
| **Cloudflare (or any CDN) in front of Node**            | CDN can cache static/ISR via `Cache-Control`, but **`revalidatePath` / `revalidateTag` do not purge the CDN**. Pair Next invalidation with CDN purge of HTML **and** RSC variants; preserve `rsc` forwarding and `_rsc` in the cache key. ([CDN Caching](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md))                                                                                                                                                                                          |
| **Build without DB**                                    | SSG + Local API needs a DB at build, or `next build --experimental-build-mode compile` / keep `force-dynamic`. [Building without a DB connection](https://payloadcms.com/docs/production/building-without-a-db-connection)                                                                                                                                                                                                                                                                                                                                                             |

### Alternatives that are not the Next Data Cache

| Approach                                          | When it is the right tool                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ISR / prerender + `revalidatePath` only**       | One URL owns the query; no shared Local API blob. Simplest self-host path after dropping `force-dynamic`. Template uses this for pages.                                                                                                                                                                                                                                                                                                                                                                                                          |
| **CDN purge APIs**                                | Edge hit rate when a CDN caches HTML/RSC. Orthogonal to `unstable_cache`; must run alongside Next revalidation ([CDN Caching](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md)). Payload Cloud upload caching is this class for **media only**.                                                                                                                                                                                                               |
| **HTTP `fetch` to Payload REST with `next.tags`** | Works if you leave the Local API. This app uses Local API; `fetch` cache options do not wrap `payload.find`.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Client SWR / React Query for CMS pages**        | Authenticated or highly personalized UI. Wrong default for public marketing pages in the prerender/RSC cache. (Older Vercel posts mention SWR for **client** fetching — not a substitute for server ISR.)                                                                                                                                                                                                                                                                                                                                        |
| **Cache Components / PPR migration**              | Unlock `"use cache"` + `cacheLife` / `cacheTag`. Next ships [Migrating to Cache Components](file:///Users/giovanniabbatepaolo/Documents/GitHub/forkbomb/morigerati/node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md) (no separate npm migrator). Needs Payload admin caveats ([payload#16020](https://github.com/payloadcms/payload/pull/16020)) and a plural remote handler for multi-instance. Packages: `next-cache-handlers`, `@mrjasonroy/…`, trieb/mirunamu plural handlers, `@pro-laico/payload-revalidate`. |

### First-party blogs (2025/2026)

Used only as product-direction signals; they do **not** name a required community package for Payload.

| Source                                                                                                                                             | Takeaway for this problem                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [ISR on Vercel…](https://vercel.com/blog/isr-on-vercel-is-now-faster-and-more-cost-efficient) (2025-01-30)                                         | On Vercel, treat ISR/Data Cache as managed; no Redis handler required for the usual case.                                                |
| [Common mistakes with the App Router…](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)                    | Revalidate after mutations (`revalidatePath` / tags) — same idea as Payload `afterChange` hooks.                                         |
| [Next.js 16.4](https://nextjs.org/blog/next-16-4) (2026-10-06)                                                                                     | Cache Components improvements at the framework level; endorsement path for Redis remains docs + examples, not a single official package. |
| [Learn advanced Next.js with Payload’s website template](https://payloadcms.com/posts/guides/learn-advanced-nextjs-with-payloads-website-template) | On-demand revalidation is a **template feature** (hooks), not a plugin.                                                                  |
| [How to build a website… with Next.js](https://payloadcms.com/posts/blog/how-to-build-a-website-blog-or-portfolio-with-nextjs)                     | SSG / ISR / ODR vocabulary for the template.                                                                                             |

Secondary “seen in the wild” tutorials are not used as authority here.

### Comparison for this deployment shape

| Path                                                                                      | Publish freshness | Shared Local API cache       | Multi-replica safe   | Extra infra                  | Matches current config                  |
| ----------------------------------------------------------------------------------------- | ----------------- | ---------------------------- | -------------------- | ---------------------------- | --------------------------------------- |
| Keep `force-dynamic`                                                                      | Always fresh      | N/A                          | Yes                  | None                         | **Current** — full render every request |
| Template: drop `force-dynamic` + hooks + optional `unstable_cache`                        | Yes               | Yes if tagged (incl. locale) | Single instance only | None                         | **Recommended next step**               |
| Above + Redis singular `cacheHandler` (forte ≥ 3.4 / trieb / mirunamu / official example) | Yes               | Yes                          | Yes                  | Redis                        | When Coolify/K8s scales to N>1          |
| CDN in front + purge on publish                                                           | Edge TTL          | No (CDN ≠ Data Cache)        | CDN-dependent        | CDN API                      | Only if edge-caching HTML/RSC           |
| `cacheComponents` + plural handlers + CC-oriented Payload plugin                          | Yes               | Via `"use cache"`            | With remote Redis    | Redis; Payload admin caveats | Later / optional                        |
| Payload Cloud plugin alone                                                                | Upload CDN only   | No for pages                 | N/A                  | Cloud env                    | Not this deploy shape                   |

| Goal                                                | Prefer                                                                                                                                                                                                 | Avoid for now                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Ship publish → visible page on one Coolify instance | Drop `force-dynamic`; template-style hooks; `revalidatePath` for `/it` and `/en`; `unstable_cache` only for shared globals/docs                                                                        | Redis “just in case”; `@payload-enchants/cached-local-api`; `cacheComponents` only for caching; `@pro-laico/payload-revalidate` |
| Same, but N replicas                                | Redis + `@fortedigital/nextjs-cache-handler` **≥ 3.4.0** or `@trieb.work/nextjs-turbo-redis-cache` / `@mirunamu/next-redis-cache` / official example; singular `cacheHandler`; `cacheMaxMemorySize: 0` | `@neshca/cache-handler`; assuming tags are cluster-wide without a shared handler                                                |
| Less hook boilerplate                               | `@ggaidelevicius/payload-isr`, `payload-revalidate`, or `payload-plugin-cache` once read-side tags match                                                                                               | Expecting a plugin to make `force-dynamic` pages fast                                                                           |
| Move to `"use cache"`                               | `cacheComponents` + payload#16020 caveats + `@mrjasonroy/…` / trieb / mirunamu / `next-cache-handlers`                                                                                                 | Treating `"use cache"` as durable across deploys without reading the remote persistence rules                                   |

**Sharpened recommendation:** stay on the previous caching model (Cache Components off). Implement the website-template pattern in-app first — no npm cache package. Introduce a Redis **singular** `cacheHandler` only when process count > 1, preferring packages that document Next **16.3.8+ / 16.4** route-scoped keys. Treat Payload community revalidate plugins as optional glue. Defer `cacheHandlers` / `"use cache: remote"` / `@pro-laico/payload-revalidate` until deliberately enabling `cacheComponents`. If a CDN sits in front, purge HTML + RSC on the same publish path as Next revalidation.

---

## Primary sources opened

Next.js 16.4.2 docs under `node_modules/next/dist/docs/`:

- `01-app/03-api-reference/04-functions/unstable_cache.md`
- `01-app/03-api-reference/04-functions/revalidateTag.md`
- `01-app/03-api-reference/04-functions/updateTag.md`
- `01-app/03-api-reference/04-functions/revalidatePath.md`
- `01-app/03-api-reference/04-functions/refresh.md`
- `01-app/03-api-reference/04-functions/cacheLife.md`
- `01-app/03-api-reference/04-functions/cacheTag.md`
- `01-app/03-api-reference/04-functions/fetch.md`
- `01-app/03-api-reference/04-functions/connection.md`
- `01-app/03-api-reference/04-functions/unstable_noStore.md`
- `01-app/03-api-reference/04-functions/io.md`
- `01-app/03-api-reference/04-functions/use-router.md`
- `01-app/03-api-reference/01-directives/use-cache.md`
- `01-app/03-api-reference/01-directives/use-cache-remote.md`
- `01-app/03-api-reference/01-directives/use-cache-private.md`
- `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`
- `01-app/03-api-reference/05-config/01-next-config-js/staleTimes.md`
- `01-app/01-getting-started/08-caching.md`
- `01-app/01-getting-started/09-revalidating.md`
- `01-app/02-guides/caching-without-cache-components.md`
- `01-app/02-guides/how-revalidation-works.md`
- `01-app/02-guides/migrating-to-cache-components.md`
- `01-app/02-guides/draft-mode.md`
- `01-app/02-guides/incremental-static-regeneration.md`
- `01-app/02-guides/upgrading/version-16.md` (Caching APIs)
- `01-app/02-guides/upgrading/version-15.md` (Client Cache)
- `01-app/04-glossary.md`

Next.js source:

- `node_modules/next/dist/server/web/spec-extension/unstable-cache.js`
- `node_modules/next/dist/server/lib/patch-fetch.js` (`validateTags`)
- `node_modules/next/dist/lib/constants.js` (tag max 256 / 128)

Payload:

- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/local-api/overview
- https://payloadcms.com/docs/configuration/localization
- https://payloadcms.com/docs/admin/preview
- https://payloadcms.com/docs/hooks/overview
- https://payloadcms.com/docs/hooks/collections
- https://payloadcms.com/docs/hooks/globals
- https://payloadcms.com/docs/hooks/context
- https://payloadcms.com/docs/performance/overview
- https://payloadcms.com/docs/live-preview/server
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/src/utilities/getDocument.ts
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/src/utilities/getGlobals.ts
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/src/collections/Pages/hooks/revalidatePage.ts
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/src/Header/hooks/revalidateHeader.ts
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/src/app/(frontend)/%5Bslug%5D/page.tsx
- https://github.com/payloadcms/payload/blob/v3.91.0/templates/website/README.md
- https://github.com/payloadcms/payload/pull/16020

`@payloadcms/next` package exports in this install (`package.json` `exports`), searched for a revalidation helper: none.

Ecosystem (npm READMEs / GitHub / Next docs / first-party blogs, verified for this section):

- Local Next docs: `cacheHandlers.md`, `incrementalCacheHandlerPath.md` (`cacheHandler`), `use-cache-remote.md`, `how-revalidation-works.md`, `cdn-caching.md`, `self-hosting.md`, `migrating-to-cache-components.md`
- https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath
- https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers
- https://nextjs.org/docs/app/guides/self-hosting#configuring-caching
- https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis (+ README community list)
- https://github.com/vercel/next.js/tree/canary/examples/cache-handler-redis-turbo
- https://www.npmjs.com/package/@neshca/cache-handler (peer `next < 15`; last 1.9.0 / 2024-11-26)
- https://www.npmjs.com/package/@fortedigital/nextjs-cache-handler (3.4.0; no `cacheHandlers` yet)
- https://www.npmjs.com/package/@trieb.work/nextjs-turbo-redis-cache
- https://www.npmjs.com/package/@mirunamu/next-redis-cache
- https://www.npmjs.com/package/next-cache-handlers
- https://www.npmjs.com/package/@mrjasonroy/cache-components-cache-handler
- https://www.npmjs.com/package/@leejpsd/nextjs-cache-handler
- https://www.npmjs.com/package/@pantheon-systems/nextjs-cache-handler
- https://www.npmjs.com/package/@upstash/redis (client only)
- https://www.npmjs.com/package/@vercel/kv (store only)
- https://www.npmjs.com/package/payload-plugin-cache
- https://www.npmjs.com/package/payload-revalidate
- https://www.npmjs.com/package/@pro-laico/payload-revalidate
- https://www.npmjs.com/package/@ggaidelevicius/payload-isr
- https://www.npmjs.com/package/@payload-enchants/cached-local-api
- https://www.npmjs.com/package/@whatworks/payload-paths
- https://www.npmjs.com/package/@composius/payload-plugin-menus
- https://www.npmjs.com/package/@payloadcms/payload-cloud (+ package README in this install)
- https://payloadcms.com/docs/production/building-without-a-db-connection
- https://vercel.com/blog/isr-on-vercel-is-now-faster-and-more-cost-efficient
- https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them
- https://nextjs.org/blog/next-16-4
- https://payloadcms.com/posts/guides/learn-advanced-nextjs-with-payloads-website-template
- https://payloadcms.com/posts/blog/how-to-build-a-website-blog-or-portfolio-with-nextjs
