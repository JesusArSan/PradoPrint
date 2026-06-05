/**
 * Base URL del backend.
 * - En desarrollo: vacío → Vite proxy enruta `/api` y `/public` al backend.
 * - En producción: definir `VITE_API_URL` (sin barra final) si la SPA y el
 *   backend no comparten dominio. Si comparten dominio, dejar vacío.
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const apiUrl = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}
