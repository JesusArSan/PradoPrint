import useSWR from 'swr'
import { apiUrl } from '../lib/api'
import { resolveProductImage } from '../lib/images'
import Card from './Card'

type Cuadro = {
  id: number
  título: string
  descripción: string
  precio: string
  imagen: string
}

type ApiResponse = { success: boolean; data: Cuadro }

const endpoint = apiUrl('/api/cuadros/random')

const fetcher = async (u: string): Promise<Cuadro> => {
  const r = await fetch(u)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const json: ApiResponse = await r.json()
  return json.data
}

export default function Cuadros() {
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
  })

  const titulo = data?.título.trim()
  const precio = data?.precio?.toString().trim()

  return (
    <Card
      title="Cuadro aleatorio"
      subtitle="API · PradoPrint"
      loading={isLoading}
      onReload={() => mutate()}
      reloadLabel="¡Otro!"
      reloadIcon="🎨"
      imageSlot={
        isLoading ? (
          <span className="text-stone-400 text-sm">Cargando…</span>
        ) : error ? (
          <span className="text-red-500 text-sm px-4 text-center">
            {(error as Error).message}
          </span>
        ) : data ? (
          <img
            src={resolveProductImage(data.imagen)}
            alt={titulo}
            loading="eager"
            className="max-w-full max-h-full object-contain"
          />
        ) : null
      }
      caption={
        data && !isLoading && !error ? (
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-stone-800 truncate">
              {titulo}
            </span>
            <span className="text-stone-500 whitespace-nowrap">
              {precio} €
            </span>
          </div>
        ) : null
      }
    />
  )
}
