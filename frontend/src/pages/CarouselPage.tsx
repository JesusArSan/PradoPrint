import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import useSWR from 'swr'
import { apiUrl } from '../lib/api'
import { resolveProductImage } from '../lib/images'

type Producto = {
  id: number
  título: string
  precio: string
  imagen: string
}

type ApiResponse = {
  success: boolean
  data: Producto[]
}

const endpoint = apiUrl('/api/productos?desde=1&hasta=115&ordenación=desc')

const fetcher = async (url: string): Promise<Producto[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json: ApiResponse = await response.json()
  return json.data
}

export default function CarouselPage() {
  const { data, error, isLoading } = useSWR(endpoint, fetcher)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-800">
          Carrusel de imagenes
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Productos del catalogo servidos por el API de PradoPrint.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-400 shadow-sm">
          Cargando carrusel...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-sm text-red-500 shadow-sm">
          {(error as Error).message}
        </div>
      ) : data && data.length > 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {data.map(producto => (
                <article
                  key={producto.id}
                  className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                    <div className="flex h-72 items-center justify-center bg-stone-100 p-4">
                      <img
                        src={resolveProductImage(producto.imagen)}
                        alt={producto.título.trim()}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                      <h3 className="line-clamp-2 text-sm font-bold text-stone-800">
                        {producto.título.trim()}
                      </h3>
                      <p className="text-sm text-stone-500">
                        {producto.precio} €
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="btn btn-outline btn-sm"
            >
              Anterior
            </button>

            <p className="text-xs text-stone-400">
              Producto {selectedIndex + 1} de {data.length}
            </p>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="btn btn-outline btn-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-400 shadow-sm">
          No hay productos disponibles.
        </div>
      )}
    </section>
  )
}
