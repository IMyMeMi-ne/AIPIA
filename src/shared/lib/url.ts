export const NO_SOURCE_URL_LABEL = 'No source URL'

function parseExternalUrl(url?: string) {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return null
  }

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null
    }

    return parsedUrl
  } catch {
    return null
  }
}

export function isValidExternalUrl(url?: string) {
  return parseExternalUrl(url) !== null
}

export function getDisplayUrl(url?: string) {
  const parsedUrl = parseExternalUrl(url)

  if (parsedUrl === null) {
    return NO_SOURCE_URL_LABEL
  }

  return parsedUrl.hostname.replace(/^www\./, '')
}
