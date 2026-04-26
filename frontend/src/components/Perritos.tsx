import { useCallback, useEffect, useRef, useState } from 'react'
import Card from './Card'

type DogResponse = { message: string; status: string }

const DOG_API = 'https://dog.ceo/api/breeds/image/random'

export default function Perritos() {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(DOG_API)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json: DogResponse = await r.json()
      if (!mounted.current) return
      setUrl(json.message)
    } catch (e) {
      if (!mounted.current) return
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    cargar()
    return () => {
      mounted.current = false
    }
  }, [cargar])

  return (
    <Card
      title="Perrito aleatorio"
      subtitle="API · dog.ceo"
      loading={loading}
      onReload={cargar}
      reloadLabel="¡Otro!"
      reloadIcon="🐶"
      imageSlot={
        loading ? (
          <span className="text-stone-400 text-sm">Cargando…</span>
        ) : error ? (
          <span className="text-red-500 text-sm px-4 text-center">
            {error}
          </span>
        ) : url ? (
          <img
            src={url}
            alt="Perrito aleatorio"
            className="max-w-full max-h-full object-contain"
          />
        ) : null
      }
    />
  )
}
