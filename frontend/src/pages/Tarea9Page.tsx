import Perritos from '../components/Perritos'
import Cuadros from '../components/Cuadros'

export default function Tarea9Page() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Perritos />
        <Cuadros />
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Imagenes de dog.ceo y catalogo PradoPrint
      </p>
    </>
  )
}
