import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const nombre_archivo_desde = (título) =>
  título.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.3'
});

const page = await context.newPage();

try {
  await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', { timeout: 15000 });
} catch (error) {
  console.error('Error cargando la página:', error);
  process.exit(1);
}

page.once('load', () => console.log('Página cargada'));
await page.waitForTimeout(3000);

// Recoger URLs
const locators_productos = page.locator('.thumbnail-container > a');
const lista_urls = [];
for (const loc of await locators_productos.all()) {
  const url = await loc.getAttribute('href');
  if (url) lista_urls.push(url);
}
console.log(`Encontrados ${lista_urls.length} productos\n`);

if (!existsSync('imagenes')) await mkdir('imagenes');
if (!existsSync('data')) await mkdir('data');

const productos = [];

for (const [i, url] of lista_urls.entries()) {
  try {
    await page.goto(url, { timeout: 15000 });
    await page.waitForTimeout(800);

    const título      = await page.locator('h1').first().innerText();
    const descripción = await page.locator('.product-description, #product-description, .page-content p').first().innerText().catch(() => '');
    const texto_precio = await page.locator('.current-price, .product-price, span[itemprop="price"]').first().innerText().catch(() => '');
    const imagen_url  = await page.locator('img.js-qv-product-cover, img.product-cover, .product-cover img, #main img').first().getAttribute('src').catch(() => '');
    const imagen      = nombre_archivo_desde(título);

    productos.push({ título, descripción, texto_precio, imagen });

    // Descargar imagen
    if (imagen_url) {
      try {
        const response = await page.context().request.get(imagen_url);
        const buffer = await response.body();
        await writeFile(`imagenes/${imagen}`, buffer);
      } catch {
        console.warn(`  Sin imagen: ${título}`);
      }
    }

    console.log(`[${i + 1}/${lista_urls.length}] ✓ ${título}`);
    await esperar(300);

  } catch (error) {
    console.warn(`[${i + 1}/${lista_urls.length}] ✗ Error en ${url}: ${error.message}`);
  }
}

await writeFile('data/productos.json', JSON.stringify(productos, null, 2));
console.log(`\nGuardados ${productos.length} productos en data/productos.json`);
console.log(`Imágenes en carpeta imagenes/`);

await browser.close();