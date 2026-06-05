import Carrousel, { type Producto } from './Carrousel'

type ProductoJson = {
  título: string
  texto_precio: string
  imagen: string
}

type Props = {
  productos: ProductoJson[]
}

export default function CarrouselSSG({ productos }: Props) {
  const productosCarrusel = productos.map<Producto>(producto => ({
    titulo: producto.título.trim(),
    precio: producto.texto_precio.trim(),
    imagen: producto.imagen,
  }))

  return <Carrousel productos={productosCarrusel} />
}
