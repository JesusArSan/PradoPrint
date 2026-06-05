import { apiUrl } from './api'

export const resolveProductImage = (raw: string): string => {
  const value = raw.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return encodeURI(apiUrl(`/public/imagenes/${value}`))
}
