export const UNKNOWN_DATE_LABEL = 'Unknown date'

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateToYyyyMmDd(date?: Date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return UNKNOWN_DATE_LABEL
  }

  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())

  return `${year}-${month}-${day}`
}

export function formatUnixSecondsDate(time?: number) {
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    return UNKNOWN_DATE_LABEL
  }

  return formatDateToYyyyMmDd(new Date(time * 1000))
}
