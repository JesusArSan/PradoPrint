/**
 * Panel lateral del carrito.
 * Carga las líneas del carrito desde GET /api/carrito-items al abrirse,
 * renderiza cada línea clonando <template id="tmpl-linea-carrito"> y
 * permite eliminar productos vía POST /carrito/eliminar/:id.
 */

const CART_API = '/api/carrito-items';
const REMOVE_ENDPOINT = (id) => `/carrito/eliminar/${id}`;

async function fetchCart() {
  const response = await fetch(CART_API, { credentials: 'include' });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error ?? 'Error al cargar carrito');
  }
  return result;
}

async function removeCartItem(id) {
  const response = await fetch(REMOVE_ENDPOINT(id), {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar producto');
  }
}

function createStateMessage(iconClass, text) {
  const li = document.createElement('li');
  li.className = 'carrito-vacio';
  const icon = document.createElement('i');
  icon.className = iconClass;
  const p = document.createElement('p');
  p.textContent = text;
  li.append(icon, p);
  return li;
}

function buildCartLine(template, item, onRemove) {
  const clone = template.content.cloneNode(true);

  const img = clone.querySelector('.carrito-item-img');
  img.src = `/public/imagenes/${item.producto.imagen}`;
  img.alt = item.producto.título;

  clone.querySelector('.carrito-item-title').textContent = item.producto.título;
  clone.querySelector('.carrito-item-price').textContent =
    `${item.producto.precio} € x ${item.cantidad}`;
  clone.querySelector('.carrito-item-cantidad').textContent =
    `Subtotal: ${item.subtotal.toFixed(2)} €`;

  clone
    .querySelector('.carrito-item-btn-remove')
    .addEventListener('click', (e) => {
      e.preventDefault();
      onRemove(item.id);
    });

  const li = document.createElement('li');
  li.appendChild(clone);
  return li;
}

function updateNavbarBadge(count) {
  const badge = document.querySelector('.navbar .position-relative .badge');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
  } else {
    badge.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const offcanvas = document.getElementById('carritoOffcanvas');
  const list = document.getElementById('carrito-lista');
  const totalLabel = document.getElementById('carrito-total-amount');
  const template = document.getElementById('tmpl-linea-carrito');

  if (!offcanvas || !list || !template) return;

  const render = (items) => {
    if (items.length === 0) {
      list.replaceChildren(createStateMessage('bi bi-cart-x', 'Tu cesta está vacía'));
      return;
    }
    list.replaceChildren(
      ...items.map((item) => buildCartLine(template, item, handleRemove))
    );
  };

  const setTotal = (total) => {
    if (totalLabel) totalLabel.textContent = `${total.toFixed(2)} €`;
  };

  const loadCart = async () => {
    try {
      const { data, total, count } = await fetchCart();
      render(data);
      setTotal(total);
      updateNavbarBadge(count);
    } catch (error) {
      console.error(error);
      list.replaceChildren(
        createStateMessage('bi bi-exclamation-triangle', 'Error al cargar carrito')
      );
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeCartItem(id);
      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  offcanvas.addEventListener('show.bs.offcanvas', loadCart);
});
