export type ProductoJson = {
  título: string
  descripción: string
  texto_precio: string
  imagen: string
}

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const productSlug = (titulo: string, index: number) =>
  `${slugify(titulo)}-${index + 1}`

export const imagePath = (imagen: string) => `/imagenes/${imagen}`
