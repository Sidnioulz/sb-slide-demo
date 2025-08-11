export interface GetHrefOptions {
  path: string
  search?: {
    [index: string]: string | undefined
  }
}

/**
 * Gets the URL to use to perform a client-side navigation to
 * another Storybook page.
 * @param options
 */
export function getHref(options: GetHrefOptions): string {
  const { location } = window.parent

  const hasIframe = location.pathname.endsWith('/iframe.html')

  const newPathname = hasIframe
    ? location.pathname.replace(/iframe.html$/, 'index.html')
    : location.pathname

  const searchParams = new URLSearchParams()

  searchParams.set('path', options.path)

  for (const [name, value] of Object.entries(options.search ?? {})) {
    if (value !== undefined) {
      searchParams.set(name, value)
    }
  }

  // We still want / to show as / in the URLSearchParams, because SB does
  // and it looks more organic if our URLs do too.
  const newHref = `${newPathname}?${searchParams
    .toString()
    .replace(/%2F/g, '/')}`

  return newHref
}
