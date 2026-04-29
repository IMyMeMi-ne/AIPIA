import { describe, expect, it } from 'vitest'
import {
  formatDateToYyyyMmDd,
  formatUnixSecondsDate,
  formatUnixSecondsDateTime,
  UNKNOWN_DATE_LABEL,
} from '@/shared/lib/date.ts'
import {
  getDisplayUrl,
  getExternalUrl,
  isValidExternalUrl,
  NO_SOURCE_URL_LABEL,
} from '@/shared/lib/url.ts'

describe('날짜 포맷 헬퍼', () => {
  it('유효한 날짜와 유닉스 초 값을 연-월-일 형식으로 변환한다', () => {
    expect(formatDateToYyyyMmDd(new Date(2024, 0, 2))).toBe('2024-01-02')
    expect(formatUnixSecondsDate(new Date(2024, 0, 2, 12).getTime() / 1000)).toBe('2024-01-02')
  })

  it('날짜가 없거나 유효하지 않으면 알 수 없음 라벨을 반환한다', () => {
    expect(formatDateToYyyyMmDd()).toBe(UNKNOWN_DATE_LABEL)
    expect(formatDateToYyyyMmDd(new Date(Number.NaN))).toBe(UNKNOWN_DATE_LABEL)
    expect(formatUnixSecondsDate()).toBe(UNKNOWN_DATE_LABEL)
    expect(formatUnixSecondsDate(Number.NaN)).toBe(UNKNOWN_DATE_LABEL)
    expect(formatUnixSecondsDate(Number.POSITIVE_INFINITY)).toBe(UNKNOWN_DATE_LABEL)
  })

  it('유효한 유닉스 초 값만 ISO datetime으로 변환한다', () => {
    const time = Date.UTC(2024, 0, 2, 12) / 1000

    expect(formatUnixSecondsDateTime(time)).toBe('2024-01-02T12:00:00.000Z')
    expect(formatUnixSecondsDateTime()).toBeUndefined()
    expect(formatUnixSecondsDateTime(Number.NaN)).toBeUndefined()
    expect(formatUnixSecondsDateTime(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(formatUnixSecondsDateTime(Number.MAX_VALUE)).toBeUndefined()
  })
})

describe('주소 헬퍼', () => {
  it('일반 및 보안 웹 주소만 허용한다', () => {
    expect(isValidExternalUrl('https://www.example.com/path')).toBe(true)
    expect(isValidExternalUrl('http://news.ycombinator.com')).toBe(true)
    expect(isValidExternalUrl('ftp://example.com')).toBe(false)
    expect(isValidExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isValidExternalUrl('https://trusted.example@evil.example/path')).toBe(false)
    expect(isValidExternalUrl('https://user:pass@example.com/path')).toBe(false)
    expect(isValidExternalUrl('not-a-url')).toBe(false)
    expect(isValidExternalUrl('   ')).toBe(false)
  })

  it('표시용 호스트명을 반환하고 앞쪽 더블유 접두사를 제거한다', () => {
    expect(getDisplayUrl('https://www.example.com/path?q=1')).toBe('example.com')
    expect(getDisplayUrl('http://news.ycombinator.com/item?id=1')).toBe('news.ycombinator.com')
  })

  it('유효한 외부 URL은 화면에 표시할 수 있는 전체 URL로 정규화한다', () => {
    expect(getExternalUrl(' https://www.example.com/path?q=1 ')).toBe(
      'https://www.example.com/path?q=1',
    )
    expect(getExternalUrl('javascript:alert(1)')).toBeUndefined()
    expect(getExternalUrl('https://trusted.example@evil.example/path')).toBeUndefined()
    expect(getExternalUrl('https://user:pass@example.com/path')).toBeUndefined()
    expect(getExternalUrl('not-a-url')).toBeUndefined()
  })

  it('주소가 유효하지 않거나 없으면 출처 없음 라벨을 반환한다', () => {
    expect(getDisplayUrl()).toBe(NO_SOURCE_URL_LABEL)
    expect(getDisplayUrl('')).toBe(NO_SOURCE_URL_LABEL)
    expect(getDisplayUrl('ftp://example.com')).toBe(NO_SOURCE_URL_LABEL)
    expect(getDisplayUrl('not-a-url')).toBe(NO_SOURCE_URL_LABEL)
  })
})
