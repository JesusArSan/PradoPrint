import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

export type Producto = {
  titulo: string
  precio: string
  imagen: string
}

type Props = {
  productos: Producto[]
}

export default function Carrousel({ productos }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-400 shadow-sm">
        No hay productos disponibles.
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">
          Carrusel de imagenes
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Productos del catalogo generados como contenido estatico e hidratados
          en una isla React.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {productos.map(producto => (
              <article
                key={`${producto.titulo}-${producto.imagen}`}
                className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                  <div className="flex h-72 items-center justify-center bg-stone-100 p-4">
                    <img
                      src={`/imagenes/${producto.imagen}`}
                      alt={producto.titulo}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                    <h2 className="line-clamp-2 text-sm font-bold text-stone-800">
                      {producto.titulo}
                    </h2>
                    <p className="text-sm text-stone-500">{producto.precio}</p>
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
            Producto {selectedIndex + 1} de {productos.length}
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
    </section>
  )
}
