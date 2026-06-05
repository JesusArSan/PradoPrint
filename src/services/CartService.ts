import { productService } from './ProductService.ts';

export interface CartItem {
  id: number;
  cantidad: number;
}

export interface CartLine {
  producto: any;
  cantidad: number;
  subtotal: number;
}

/**
 * Encapsula la lógica del carrito basado en sesión.
 * La sesión almacena sólo { id, cantidad }; los datos del producto
 * se resuelven bajo demanda para evitar duplicar información.
 */
export class CartService {
  getItems(session: any): CartItem[] {
    return session.carrito ?? [];
  }

  addItem(session: any, id: number, cantidad: number): void {
    if (cantidad <= 0) return;

    session.carrito ??= [];
    const existing = session.carrito.find((item: CartItem) => item.id === id);

    if (existing) {
      existing.cantidad += cantidad;
    } else {
      session.carrito.push({ id, cantidad });
    }

    this.refreshTotal(session);
  }

  removeItem(session: any, id: number): void {
    if (!session.carrito) return;
    session.carrito = session.carrito.filter((item: CartItem) => item.id !== id);
    this.refreshTotal(session);
  }

  updateQuantity(session: any, id: number, cantidad: number): void {
    if (!session.carrito) return;

    if (cantidad <= 0) {
      this.removeItem(session, id);
      return;
    }

    const item = session.carrito.find((i: CartItem) => i.id === id);
    if (item) item.cantidad = cantidad;

    this.refreshTotal(session);
  }

  clear(session: any): void {
    session.carrito = [];
    session.total_carrito = 0;
  }

  /**
   * Resuelve los items de la sesión con los datos completos del producto.
   * Se usa tanto en la vista /carrito como en la API del offcanvas.
   */
  async getLines(session: any): Promise<CartLine[]> {
    const items = this.getItems(session);
    if (items.length === 0) return [];

    return Promise.all(
      items.map(async (item) => {
        const producto = await productService.getProductById(item.id);
        return {
          producto,
          cantidad: item.cantidad,
          subtotal: Number(producto.precio) * item.cantidad,
        };
      })
    );
  }

  calculateTotal(lines: CartLine[]): number {
    return lines.reduce((acc, line) => acc + line.subtotal, 0);
  }

  private refreshTotal(session: any): void {
    session.total_carrito = (session.carrito ?? []).reduce(
      (acc: number, item: CartItem) => acc + item.cantidad,
      0
    );
  }
}

export const cartService = new CartService();
