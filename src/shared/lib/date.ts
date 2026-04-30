export const UNKNOWN_DATE_LABEL = 'Unknown date'

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateToYyyyMmDd(date?: Date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return UNKNOWN_DATE_LABEL
  }

  const year = date.getUTCFullYear()
  const month = padDatePart(date.getUTCMonth() + 1)
  const day = padDatePart(date.getUTCDate())

  return `${year}-${month}-${day}`
}

export function formatUnixSecondsDate(time?: number) {
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    return UNKNOWN_DATE_LABEL
  }

  return formatDateToYyyyMmDd(new Date(time * 1000))
}

export function formatUnixSecondsDateTime(time?: number) {
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    return undefined
  }

  const date = new Date(time * 1000)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}
