import { NavLink } from 'react-router-dom'

const pages = [
  {
    to: '/tarea-9',
    label: 'Galeria aleatoria',
    description: 'Imagen externa y cuadro aleatorio de la tienda.',
  },
  {
    to: '/carousel',
    label: 'Carrusel',
    description: 'Recorrido visual por productos del catalogo.',
  },
]

export default function HomePage() {
  return (
    <section className="max-w-2xl space-y-8">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Portada</h2>
        <p className="text-sm leading-6 text-stone-600">
          Una entrada sencilla al front de Prado Print. Desde aqui puedes abrir
          la galeria aleatoria o recorrer el catalogo en carrusel.
        </p>
      </div>

      <div className="divide-y divide-stone-200 border-y border-stone-200">
        {pages.map(page => (
          <NavLink
            key={page.to}
            to={page.to}
            className="block py-5 transition-colors hover:text-stone-500"
          >
            <span className="block text-sm font-bold text-stone-900">
              {page.label}
            </span>
            <span className="mt-1 block text-sm leading-6 text-stone-500">
              {page.description}
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  )
}
