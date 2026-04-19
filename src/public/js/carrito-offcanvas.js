/**
 * Carrito Offcanvas con Template DOM
 *
 * Este módulo implementa un panel lateral (offcanvas) para visualizar
 * el carrito sin salir de la página actual. Usa HTML <template> + cloneNode
 * para generar dinámicamente el HTML de cada producto.
 *
 * Características:
 * - Mock API en JS con getCart() y removeFromCart()
 * - Fetch de datos del servidor vía GET /api/carrito-items
 * - Renderizado con <template id="tmpl-linea-carrito"> + cloneNode(true)
 * - Eliminación sin recargar página
 * - Sincronización con el carrito de sesión del servidor
 *
 * UX Principles:
 * - Offcanvas: no recarga la página, usuario permanece en contexto
 * - Template + cloneNode: no hay HTML hardcodeado en JS, fácil mantener
 * - Botón eliminar: elimina al instante, sin clic extra
 * - "Ver cesta completa": enlace al carrito full con más opciones
 */

document.addEventListener('DOMContentLoaded', () => {
  const carritoOffcanvas = document.getElementById('carritoOffcanvas');
  const carritoLista = document.getElementById('carrito-lista');
  const carritoTotal = document.getElementById('carrito-total-amount');
  const tmplLineaCarrito = document.getElementById('tmpl-linea-carrito');

  if (!carritoOffcanvas || !carritoLista || !tmplLineaCarrito) return;

  // ============================================================
  // 1. MOCK CART API
  // ============================================================
  const mockCart = {
    items: [],

    /** Obtiene los items actuales del carrito */
    getCart() {
      return this.items;
    },

    /** Elimina un producto del carrito por ID */
    removeFromCart(id) {
      this.items = this.items.filter((item) => item.id !== id);
    },

    /** Actualiza el estado del carrito con nuevos items */
    setCart(items) {
      this.items = items;
    },

    /** Calcula el total del carrito */
    getTotal() {
      return this.items.reduce((acc, item) => acc + item.subtotal, 0);
    },
  };

  // ============================================================
  // 2. EVENT: Al abrir el offcanvas, cargar items del servidor
  // ============================================================
  carritoOffcanvas.addEventListener('show.bs.offcanvas', async () => {
    await loadCarritoItems();
  });

  // ============================================================
  // 3. CARGAR ITEMS DEL SERVIDOR
  // ============================================================
  async function loadCarritoItems() {
    try {
      // credentials: 'include' para enviar cookies de sesión
      const response = await fetch('/api/carrito-items', {
        credentials: 'include',
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar carrito');
      }

      // Actualizar mock API con datos del servidor
      mockCart.setCart(result.data);

      // Renderizar en la UI
      renderCarritoList(result.data);

      // Actualizar total
      updateCarritoTotal(result.total);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      carritoLista.innerHTML =
        '<li class="carrito-vacio"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar carrito</p></li>';
    }
  }

  // ============================================================
  // 4. RENDERIZAR LISTA DE PRODUCTOS CON <template> + cloneNode
  // ============================================================
  function renderCarritoList(items) {
    // Limpiar lista
    carritoLista.innerHTML = '';

    // Si carrito vacío, mostrar mensaje
    if (items.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'carrito-vacio';
      emptyLi.innerHTML =
        '<i class="bi bi-cart-x"></i><p>Tu cesta está vacía</p>';
      carritoLista.appendChild(emptyLi);
      return;
    }

    // Para cada item, clonar template y rellenar datos
    items.forEach((item) => {
      // Clonar template con cloneNode(true) — copia profunda del HTML
      const clone = tmplLineaCarrito.content.cloneNode(true);

      // Rellenar datos del producto en el clon
      clone.querySelector('.carrito-item-img').src =
        `/public/imagenes/${item.producto.imagen}`;
      clone.querySelector('.carrito-item-img').alt = item.producto.título;
      clone.querySelector('.carrito-item-title').textContent =
        item.producto.título;
      clone.querySelector('.carrito-item-price').textContent =
        `${item.producto.precio} € x ${item.cantidad}`;
      clone.querySelector('.carrito-item-cantidad').textContent =
        `Subtotal: ${item.subtotal.toFixed(2)} €`;

      // Event listener al botón eliminar
      clone
        .querySelector('.carrito-item-btn-remove')
        .addEventListener('click', (e) => {
          e.preventDefault();
          removeFromCarrito(item.id);
        });

      // Añadir clon a la lista
      const li = document.createElement('li');
      li.appendChild(clone);
      carritoLista.appendChild(li);
    });
  }

  // ============================================================
  // 5. ELIMINAR PRODUCTO DEL CARRITO
  // ============================================================
  async function removeFromCarrito(productId) {
    try {
      // Eliminar del mock local
      mockCart.removeFromCart(productId);

      // Enviar al servidor (credentials para mantener sesión)
      const response = await fetch(`/carrito/eliminar/${productId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      // Recargar lista desde el servidor
      await loadCarritoItems();

      // Actualizar badge del navbar
      updateCartBadge();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  }

  // ============================================================
  // 6. ACTUALIZAR TOTAL VISIBLE
  // ============================================================
  function updateCarritoTotal(total) {
    if (carritoTotal) {
      carritoTotal.textContent = `${total.toFixed(2)} €`;
    }
  }

  // ============================================================
  // 7. ACTUALIZAR BADGE DEL CARRITO EN NAVBAR
  // ============================================================
  function updateCartBadge() {
    const items = mockCart.getCart();
    const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
    const badgeElement = document.querySelector(
      '.navbar .position-relative .badge'
    );

    if (badgeElement) {
      if (totalItems > 0) {
        badgeElement.textContent = totalItems;
      } else {
        badgeElement.remove();
      }
    }
  }
});
