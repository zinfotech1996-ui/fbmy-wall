const timeOnly = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})

const monthDay = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

const monthDayYear = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const weekday = new Intl.DateTimeFormat(undefined, { weekday: "long" })

const fullDateTime = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime()
}

export function formatRelativeTime(
  iso: string,
  now: number = Date.now(),
): string {
  const date = new Date(iso)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) return "Just now"

  const diff = Math.max(0, now - timestamp)
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  const today = startOfDay(new Date(now))
  const thatDay = startOfDay(date)

  if (diff < 45_000) return "Just now"
  if (diff < 90_000) return "1 minute ago"
  if (minutes < 60) return `${minutes} minutes ago`
  if (diff < 2 * 3_600_000) return "1 hour ago"
  if (hours < 24 && thatDay === today) {
    return `Today at ${timeOnly.format(date)}`
  }
  if (thatDay === today - 86_400_000) {
    return `Yesterday at ${timeOnly.format(date)}`
  }
  if (days < 7) return `${weekday.format(date)} at ${timeOnly.format(date)}`
  if (date.getFullYear() === new Date(now).getFullYear()) {
    return `${monthDay.format(date)} at ${timeOnly.format(date)}`
  }

  return monthDayYear.format(date)
}

export function formatFullDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return fullDateTime.format(date)
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return monthDayYear.format(date)
}
