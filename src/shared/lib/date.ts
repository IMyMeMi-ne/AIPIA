export const UNKNOWN_DATE_LABEL = 'Unknown date'

export function formatUnixSecondsDate(time?: number) {
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    return UNKNOWN_DATE_LABEL
  }

  const date = new Date(time * 1000)

  if (Number.isNaN(date.getTime())) {
    return UNKNOWN_DATE_LABEL
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
