export const formatNumber = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)

export const parseNhtsaDate = (value: string | number | Date) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value: string | number | Date) => {
  const date = parseNhtsaDate(value)
  if (!date) {
    return 'Data indisponível'
  }
  const base = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)

  return base.replace(/\sde\s/gi, ' ').replace('.', '').replace(/\s+/g, ' ').trim()
}
