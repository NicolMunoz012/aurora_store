// Elimina productos y categorías de demo.
// Correr: node packages/database/prisma/clear-demo.mjs

import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:81edfccc030626c266c265a80651e4b4@6rip9ut9.us-east.database.insforge.app:5432/insforge",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query('DELETE FROM product_images');
await client.query('DELETE FROM products');
await client.query('DELETE FROM categories');

console.log("✓ Productos, imágenes y categorías eliminados.");

await client.end();
