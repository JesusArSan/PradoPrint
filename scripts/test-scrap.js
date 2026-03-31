import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false }); // abre el navegador para verlo
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.3'
});

const page = await context.newPage();

// Cargamos el listado
await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', { timeout: 15000 });
await page.waitForTimeout(3000);

// Cogemos solo la primera URL
const locators_productos = page.locator('.thumbnail-container > a');
const primera_url = await locators_productos.first().getAttribute('href');
console.log('URL del primer producto:', primera_url);

// Visitamos ese producto
await page.goto(primera_url, { timeout: 15000 });
await page.waitForTimeout(2000);

// Volcamos todo el texto de la página para ver qué hay
console.log('TÍTULO h1:', await page.locator('h1').first().innerText().catch(() => 'NO ENCONTRADO'));
console.log('BODY (primeros 2000 chars):\n', (await page.locator('body').innerText()).slice(0, 2000));

// Buscar imagen del producto
const img = await page.locator('img.js-qv-product-cover, img.product-cover, .product-cover img, #main img').first().getAttribute('src').catch(() => 'NO ENCONTRADO');
console.log('IMAGEN src:', img);

// Buscar descripción
const desc = await page.locator('.product-description, #product-description, .page-content p').first().innerText().catch(() => 'NO ENCONTRADO');
console.log('DESCRIPCIÓN:', desc);

// Buscar precio
const precio = await page.locator('.current-price, .product-price, span[itemprop="price"]').first().innerText().catch(() => 'NO ENCONTRADO');
console.log('PRECIO:', precio);

await browser.close();