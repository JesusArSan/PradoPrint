import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  imageSlot: ReactNode
  caption?: ReactNode
  onReload: () => void
  reloadLabel: string
  reloadIcon: string
  loading?: boolean
}

/**
 * Tarjeta reutilizable. El "imageSlot" tiene altura fija (h-80) y la imagen
 * usa object-contain → cualquier tamaño/aspecto encaja sin descuadrar.
 */
export default function Card({
  title,
  subtitle,
  imageSlot,
  caption,
  onReload,
  reloadLabel,
  reloadIcon,
  loading = false,
}: Props) {
  return (
    <article className="flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <header className="px-5 pt-5 pb-3">
        <h2 className="text-lg font-bold text-stone-800">{title}</h2>
        {subtitle && (
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        )}
      </header>

      <div className="mx-5 h-80 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden">
        {imageSlot}
      </div>

      <div className="px-5 pt-4 min-h-12 text-sm text-stone-600">
        {caption}
      </div>

      <footer className="px-5 pb-5 pt-2">
        <button
          onClick={onReload}
          disabled={loading}
          className="w-full font-bold cursor-pointer bg-stone-900 text-white py-3 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {reloadLabel} <span className="ml-1">{reloadIcon}</span>
        </button>
      </footer>
    </article>
  )
}
