export const BASE_YEAR = 2000
export const FUTURE_YEAR_BUFFER = 6
export const MAX_WEEK_NUMBER = 5

export const createEmptyEntry = () => ({
  date: '',
  hours: '',
  minutes: '',
  taskDescription: '',
  projectName: '',
  projectId: '',
})

export const isEntryEmpty = (entry) =>
  Object.values(entry).every((value) => String(value).trim() === '')

export const getEntryValidationError = (entry, rowNo, weekBounds) => {
  if (
    !entry.date ||
    !entry.projectName.trim() ||
    !entry.taskDescription.trim() ||
    entry.hours === '' ||
    entry.minutes === '' ||
    entry.projectId === ''
  ) {
    return `Please complete all fields for entry ${rowNo}.`
  }

  const hours = Number(entry.hours)
  const minutes = Number(entry.minutes)
  const projectId = Number(entry.projectId)

  if (!Number.isInteger(hours) || hours < 0 || hours > 24) {
    return `Hours in entry ${rowNo} must be between 0 and 24.`
  }

  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    return `Minutes in entry ${rowNo} must be between 0 and 59.`
  }

  if (hours === 24 && minutes > 0) {
    return `If hours is 24, minutes in entry ${rowNo} must be 0.`
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return `Project ID in entry ${rowNo} must be a positive number.`
  }

  if (weekBounds && (entry.date < weekBounds.start || entry.date > weekBounds.end)) {
    return `Date in entry ${rowNo} must be between ${weekBounds.start} and ${weekBounds.end}.`
  }

  return null
}

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateInputValue = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const getWeekDateOptions = (bounds) => {
  if (!bounds) {
    return []
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

  const dates = []
  const current = fromDateInputValue(bounds.start)
  const end = fromDateInputValue(bounds.end)

  while (current <= end) {
    const value = toDateInputValue(current)
    dates.push({ value, label: formatter.format(current) })
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export const getWeekBounds = (selectedYear, selectedMonth, selectedWeek) => {
  const monthInt = Number(selectedMonth)
  const yearInt = Number(selectedYear)
  const weekInt = Number(selectedWeek)

  if (!Number.isInteger(monthInt) || !Number.isInteger(yearInt) || !Number.isInteger(weekInt)) {
    return null
  }

  const startOfMonth = new Date(yearInt, monthInt - 1, 1)
  const endOfMonth = new Date(yearInt, monthInt, 0)
  const startDay = startOfMonth.getDay()
  const firstSundayOffset = (7 - startDay) % 7
  const firstSunday = new Date(yearInt, monthInt - 1, 1 + firstSundayOffset)

  let startOfWeek
  let endOfWeek

  if (weekInt === 0) {
    startOfWeek = startOfMonth
    endOfWeek = firstSunday
  } else {
    startOfWeek = new Date(firstSunday)
    startOfWeek.setDate(firstSunday.getDate() + 1 + 7 * (weekInt - 1))

    endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    if (endOfWeek > endOfMonth) {
      endOfWeek = endOfMonth
    }
  }

  if (startOfWeek > endOfMonth || startOfWeek > endOfWeek) {
    return null
  }

  return {
    start: toDateInputValue(startOfWeek),
    end: toDateInputValue(endOfWeek),
  }
}

export const getDefaultWeekNumberForDate = (date) => {
  const selectedYear = String(date.getFullYear())
  const selectedMonth = String(date.getMonth() + 1)
  const dateValue = toDateInputValue(date)

  for (let weekNumber = 0; weekNumber <= MAX_WEEK_NUMBER; weekNumber += 1) {
    const bounds = getWeekBounds(selectedYear, selectedMonth, String(weekNumber))
    if (bounds && dateValue >= bounds.start && dateValue <= bounds.end) {
      return String(weekNumber)
    }
  }

  return '0'
}
