const toTitle = (value) => {
  if (!value) return '-'
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const formatHours = (value) => {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(2)
}

export { toTitle, formatDate, formatHours }
